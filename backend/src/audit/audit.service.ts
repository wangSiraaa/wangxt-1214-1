import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatteryAuditIndex } from './entities/battery-audit-index.entity';
import { FlowEventAudit } from './entities/flow-event-audit.entity';
import { FlowEventDocument } from '../flow/schemas/flow-event.schema';
import { BatteryDocument } from '../battery/schemas/battery.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(BatteryAuditIndex)
    private batteryAuditIndexRepo: Repository<BatteryAuditIndex>,
    @InjectRepository(FlowEventAudit)
    private flowEventAuditRepo: Repository<FlowEventAudit>,
  ) {}

  async syncBattery(battery: BatteryDocument): Promise<void> {
    const existing = await this.batteryAuditIndexRepo.findOne({
      where: { batteryCode: battery.batteryCode },
    });

    const data = {
      batteryCode: battery.batteryCode,
      mongoBatteryId: battery._id.toString(),
      vin: battery.vin || null,
      vehiclePlate: battery.vehiclePlate || null,
      status: battery.status,
      safetyLevel: battery.safetyLevel || null,
      capacity: battery.capacity || null,
      internalResistance: battery.internalResistance || null,
      receiver: battery.receiver || null,
      receiveDate: battery.receiveDate || null,
      inspector: battery.inspector || null,
      inspectionDate: battery.inspectionDate || null,
      cascadePurpose: battery.cascadePurpose || null,
      customerName: battery.customerName || null,
      salesPerson: battery.salesPerson || null,
      saleDate: battery.saleDate || null,
      isInspectionLocked: battery.isInspectionLocked,
      lastOperator: battery.updatedAt ? 'system' : null,
      lastOperationTime: battery.updatedAt ? new Date(battery.updatedAt as any) : null,
    };

    if (existing) {
      await this.batteryAuditIndexRepo.update(existing.id, data);
    } else {
      await this.batteryAuditIndexRepo.save(data);
    }
  }

  async syncFlowEvent(event: FlowEventDocument): Promise<void> {
    const existing = await this.flowEventAuditRepo.findOne({
      where: { mongoEventId: event._id.toString() },
    });

    if (existing) {
      return;
    }

    const auditEvent = this.flowEventAuditRepo.create({
      batteryCode: event.batteryCode,
      mongoBatteryId: event.batteryId.toString(),
      mongoEventId: event._id.toString(),
      eventType: event.eventType,
      fromStatus: event.fromStatus || null,
      toStatus: event.toStatus || null,
      operator: event.operator || null,
      eventTime: event.operationTime || new Date(),
      remark: event.remark || null,
      beforeData: event.beforeData || null,
      afterData: event.afterData || null,
    });

    await this.flowEventAuditRepo.save(auditEvent);

    const batteryIndex = await this.batteryAuditIndexRepo.findOne({
      where: { batteryCode: event.batteryCode },
    });

    if (batteryIndex) {
      batteryIndex.currentEventType = event.eventType;
      batteryIndex.lastOperator = event.operator || null;
      batteryIndex.lastOperationTime = event.operationTime || new Date();
      if (event.toStatus) {
        batteryIndex.status = event.toStatus;
      }
      await this.batteryAuditIndexRepo.save(batteryIndex);
    }
  }

  async getBatteryAuditList(params: {
    page?: number;
    pageSize?: number;
    batteryCode?: string;
    status?: string;
    safetyLevel?: string;
    vin?: string;
  }): Promise<{ list: BatteryAuditIndex[]; total: number }> {
    const { page = 1, pageSize = 20, ...filters } = params;
    const query = this.batteryAuditIndexRepo.createQueryBuilder('b');

    if (filters.batteryCode) {
      query.andWhere('b.batteryCode LIKE :batteryCode', {
        batteryCode: `%${filters.batteryCode}%`,
      });
    }
    if (filters.status) {
      query.andWhere('b.status = :status', { status: filters.status });
    }
    if (filters.safetyLevel) {
      query.andWhere('b.safetyLevel = :safetyLevel', { safetyLevel: filters.safetyLevel });
    }
    if (filters.vin) {
      query.andWhere('b.vin LIKE :vin', { vin: `%${filters.vin}%` });
    }

    query.orderBy('b.updatedAt', 'DESC');
    query.skip((page - 1) * pageSize);
    query.take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return { list, total };
  }

  async getFlowEventAuditList(params: {
    page?: number;
    pageSize?: number;
    batteryCode?: string;
    eventType?: string;
    operator?: string;
  }): Promise<{ list: FlowEventAudit[]; total: number }> {
    const { page = 1, pageSize = 20, ...filters } = params;
    const query = this.flowEventAuditRepo.createQueryBuilder('e');

    if (filters.batteryCode) {
      query.andWhere('e.batteryCode LIKE :batteryCode', {
        batteryCode: `%${filters.batteryCode}%`,
      });
    }
    if (filters.eventType) {
      query.andWhere('e.eventType = :eventType', { eventType: filters.eventType });
    }
    if (filters.operator) {
      query.andWhere('e.operator LIKE :operator', { operator: `%${filters.operator}%` });
    }

    query.orderBy('e.eventTime', 'DESC');
    query.skip((page - 1) * pageSize);
    query.take(pageSize);

    const [list, total] = await query.getManyAndCount();

    return { list, total };
  }
}
