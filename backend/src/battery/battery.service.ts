import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Battery, BatteryDocument, BatteryStatus, SafetyLevel } from './schemas/battery.schema';
import { RegisterBatteryDto, UpdateBatteryDto, QueryBatteryDto, SupplementVinDto, SaveMode } from './dto/battery.dto';
import { FlowService } from '../flow/flow.service';
import { FlowEventType } from '../flow/schemas/flow-event.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class BatteryService {
  constructor(
    @InjectModel(Battery.name) private batteryModel: Model<BatteryDocument>,
    @Inject(forwardRef(() => FlowService))
    private flowService: FlowService,
    @Inject(forwardRef(() => AuditService))
    private auditService: AuditService,
  ) {}

  async register(dto: RegisterBatteryDto, operator: string): Promise<BatteryDocument> {
    const isPendingVin = dto.saveMode === SaveMode.PENDING_VIN || !dto.vin;

    if (!isPendingVin && (!dto.vin || dto.vin.length < 17)) {
      throw new BadRequestException('VIN码不完整，不能入库登记');
    }

    const existing = await this.batteryModel.findOne({ batteryCode: dto.batteryCode }).exec();
    if (existing) {
      throw new BadRequestException('电池包编号已存在');
    }

    const initialStatus = isPendingVin ? BatteryStatus.PENDING_VIN : BatteryStatus.REGISTERED;

    const battery = new this.batteryModel({
      ...dto,
      status: initialStatus,
      receiver: dto.receiver || operator,
      receiveDate: dto.receiveDate || new Date(),
      isInspectionLocked: false,
    });

    const savedBattery = await battery.save();

    await this.flowService.recordEvent(
      savedBattery._id as Types.ObjectId,
      savedBattery.batteryCode,
      FlowEventType.REGISTER,
      operator,
      {
        toStatus: initialStatus,
        remark: isPendingVin ? '入厂登记（VIN待补录）' : '入厂登记',
        afterData: savedBattery.toObject(),
      },
    );

    try {
      await this.auditService.syncBattery(savedBattery);
    } catch (error) {
      console.error('Failed to sync battery to audit:', error);
    }

    return savedBattery;
  }

  async supplementVin(id: string, dto: SupplementVinDto, operator: string): Promise<BatteryDocument> {
    const battery = await this.findById(id);

    if (battery.status !== BatteryStatus.PENDING_VIN) {
      throw new BadRequestException('该电池包状态不是待补录VIN，无需补录');
    }

    if (!this.validateVin(dto.vin)) {
      throw new BadRequestException('VIN码格式不正确，需17位有效字符');
    }

    const beforeData = battery.toObject();

    battery.vin = dto.vin;
    battery.status = BatteryStatus.REGISTERED;
    const updatedBattery = await battery.save();

    await this.flowService.recordEvent(
      battery._id as Types.ObjectId,
      battery.batteryCode,
      FlowEventType.VIN_SUPPLEMENT,
      operator,
      {
        fromStatus: BatteryStatus.PENDING_VIN,
        toStatus: BatteryStatus.REGISTERED,
        remark: 'VIN补录完成',
        beforeData,
        afterData: updatedBattery.toObject(),
      },
    );

    try {
      await this.auditService.syncBattery(updatedBattery);
    } catch (error) {
      console.error('Failed to sync battery to audit:', error);
    }

    return updatedBattery;
  }

  async findById(id: string): Promise<BatteryDocument> {
    const battery = await this.batteryModel.findById(id).exec();
    if (!battery) {
      throw new NotFoundException('电池包不存在');
    }
    return battery;
  }

  async findByCode(batteryCode: string): Promise<BatteryDocument> {
    const battery = await this.batteryModel.findOne({ batteryCode }).exec();
    if (!battery) {
      throw new NotFoundException('电池包不存在');
    }
    return battery;
  }

  async findAll(query: QueryBatteryDto): Promise<{ list: BatteryDocument[]; total: number }> {
    const { page = 1, pageSize = 20, ...filters } = query;
    const mongoQuery: any = {};

    if (filters.batteryCode) {
      mongoQuery.batteryCode = { $regex: filters.batteryCode, $options: 'i' };
    }
    if (filters.vin) {
      mongoQuery.vin = { $regex: filters.vin, $options: 'i' };
    }
    if (filters.status) {
      mongoQuery.status = filters.status;
    }
    if (filters.safetyLevel) {
      mongoQuery.safetyLevel = filters.safetyLevel;
    }
    if (filters.receiver) {
      mongoQuery.receiver = { $regex: filters.receiver, $options: 'i' };
    }
    if (filters.vehiclePlate) {
      mongoQuery.vehiclePlate = { $regex: filters.vehiclePlate, $options: 'i' };
    }

    const [list, total] = await Promise.all([
      this.batteryModel
        .find(mongoQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.batteryModel.countDocuments(mongoQuery).exec(),
    ]);

    return { list, total };
  }

  async update(id: string, dto: UpdateBatteryDto, operator: string): Promise<BatteryDocument> {
    const battery = await this.findById(id);

    if (battery.isInspectionLocked) {
      throw new BadRequestException('该电池包已进入梯次出库，不能修改登记信息');
    }

    const beforeData = battery.toObject();
    let statusChanged = false;

    if (battery.status === BatteryStatus.PENDING_VIN && dto.vin) {
      if (!this.validateVin(dto.vin)) {
        throw new BadRequestException('VIN码格式不正确，需17位有效字符');
      }
      battery.status = BatteryStatus.REGISTERED;
      statusChanged = true;
    }

    battery.set(dto);
    const updatedBattery = await battery.save();

    const extraEventData: Record<string, any> = {
      remark: statusChanged ? '修改登记信息并补录VIN' : '修改登记信息',
      beforeData,
      afterData: updatedBattery.toObject(),
    };

    if (statusChanged) {
      extraEventData.fromStatus = BatteryStatus.PENDING_VIN;
      extraEventData.toStatus = BatteryStatus.REGISTERED;
    }

    await this.flowService.recordEvent(
      battery._id as Types.ObjectId,
      battery.batteryCode,
      statusChanged ? FlowEventType.VIN_SUPPLEMENT : FlowEventType.MODIFY,
      operator,
      extraEventData,
    );

    try {
      await this.auditService.syncBattery(updatedBattery);
    } catch (error) {
      console.error('Failed to sync battery to audit:', error);
    }

    return updatedBattery;
  }

  async updateStatus(
    id: string,
    status: BatteryStatus,
    operator: string,
    eventType: FlowEventType,
    remark?: string,
    extraData?: Record<string, any>,
  ): Promise<BatteryDocument> {
    const battery = await this.findById(id);

    if (battery.status === BatteryStatus.PENDING_VIN) {
      throw new BadRequestException('该电池包VIN待补录，需先补录VIN才能继续流转');
    }

    const beforeData = battery.toObject();
    const fromStatus = battery.status;

    if (extraData) {
      battery.set(extraData);
    }
    battery.status = status;
    const updatedBattery = await battery.save();

    await this.flowService.recordEvent(
      battery._id as Types.ObjectId,
      battery.batteryCode,
      eventType,
      operator,
      {
        fromStatus,
        toStatus: status,
        remark,
        beforeData,
        afterData: updatedBattery.toObject(),
      },
    );

    try {
      await this.auditService.syncBattery(updatedBattery);
    } catch (error) {
      console.error('Failed to sync battery to audit:', error);
    }

    return updatedBattery;
  }

  async getStatistics(): Promise<Record<string, number>> {
    const [total, pendingVin, registered, inspecting, qualified, unqualified, forSale, sold] = await Promise.all([
      this.batteryModel.countDocuments().exec(),
      this.batteryModel.countDocuments({ status: BatteryStatus.PENDING_VIN }).exec(),
      this.batteryModel.countDocuments({ status: BatteryStatus.REGISTERED }).exec(),
      this.batteryModel.countDocuments({ status: BatteryStatus.INSPECTING }).exec(),
      this.batteryModel.countDocuments({ status: BatteryStatus.QUALIFIED }).exec(),
      this.batteryModel.countDocuments({ status: BatteryStatus.UNQUALIFIED }).exec(),
      this.batteryModel.countDocuments({ status: BatteryStatus.FOR_SALE }).exec(),
      this.batteryModel.countDocuments({ status: BatteryStatus.SOLD }).exec(),
    ]);

    return {
      total,
      pendingVin,
      registered,
      inspecting,
      qualified,
      unqualified,
      forSale,
      sold,
    };
  }

  validateVin(vin: string): boolean {
    if (!vin || vin.length !== 17) {
      return false;
    }
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }
}
