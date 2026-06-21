import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Inspection, InspectionDocument, InspectionResult, SafetyLevel } from './schemas/inspection.schema';
import { CreateInspectionDto, UpdateInspectionDto, QueryInspectionDto } from './dto/inspection.dto';
import { BatteryService } from '../battery/battery.service';
import { BatteryStatus } from '../battery/schemas/battery.schema';
import { FlowEventType } from '../flow/schemas/flow-event.schema';

@Injectable()
export class InspectionService {
  constructor(
    @InjectModel(Inspection.name) private inspectionModel: Model<InspectionDocument>,
    @Inject(forwardRef(() => BatteryService))
    private batteryService: BatteryService,
  ) {}

  async create(dto: CreateInspectionDto, operator: string): Promise<InspectionDocument> {
    const battery = await this.batteryService.findById(dto.batteryId);

    if (battery.status === BatteryStatus.PENDING_VIN) {
      throw new BadRequestException('该电池包VIN待补录，需先补录VIN才能进行安全分级检测');
    }

    if (battery.isInspectionLocked) {
      throw new BadRequestException('该电池包已进入梯次出库，不能再录入或修改检测结论');
    }

    const isQualified = this.isSafetyQualified(dto.safetyLevel);

    const inspection = new this.inspectionModel({
      ...dto,
      inspectionDate: dto.inspectionDate || new Date(),
      result: isQualified ? InspectionResult.QUALIFIED : InspectionResult.UNQUALIFIED,
      isLocked: false,
    });

    const savedInspection = await inspection.save();

    const extraData: Record<string, any> = {
      capacity: dto.capacity,
      internalResistance: dto.internalResistance,
      safetyLevel: dto.safetyLevel,
      inspector: dto.inspector,
      inspectionDate: dto.inspectionDate || new Date(),
    };

    if (isQualified) {
      await this.batteryService.updateStatus(
        dto.batteryId,
        BatteryStatus.QUALIFIED,
        operator,
        FlowEventType.INSPECTION_COMPLETE,
        '检测合格，进入梯次利用路线',
        extraData,
      );
    } else {
      await this.batteryService.updateStatus(
        dto.batteryId,
        BatteryStatus.UNQUALIFIED,
        operator,
        FlowEventType.UNQUALIFIED,
        '安全等级不达标，转拆解路线',
        extraData,
      );
    }

    return savedInspection;
  }

  async update(id: string, dto: UpdateInspectionDto, operator: string): Promise<InspectionDocument> {
    const inspection = await this.findById(id);

    if (inspection.isLocked) {
      throw new BadRequestException('该检测记录已锁定，不能修改');
    }

    const battery = await this.batteryService.findById(inspection.batteryId.toString());

    if (battery.status === BatteryStatus.PENDING_VIN) {
      throw new BadRequestException('该电池包VIN待补录，需先补录VIN才能进行安全分级检测');
    }

    if (battery.isInspectionLocked) {
      throw new BadRequestException('该电池包已进入梯次出库，不能修改检测结论');
    }

    inspection.set(dto);

    if (dto.safetyLevel) {
      const isQualified = this.isSafetyQualified(dto.safetyLevel);
      inspection.result = isQualified ? InspectionResult.QUALIFIED : InspectionResult.UNQUALIFIED;
    }

    const updatedInspection = await inspection.save();

    const extraData: Record<string, any> = {
      capacity: updatedInspection.capacity,
      internalResistance: updatedInspection.internalResistance,
      safetyLevel: updatedInspection.safetyLevel,
    };

    const isQualified = this.isSafetyQualified(updatedInspection.safetyLevel);
    const newStatus = isQualified ? BatteryStatus.QUALIFIED : BatteryStatus.UNQUALIFIED;
    const eventType = isQualified ? FlowEventType.INSPECTION_COMPLETE : FlowEventType.UNQUALIFIED;

    await this.batteryService.updateStatus(
      inspection.batteryId.toString(),
      newStatus,
      operator,
      eventType,
      '更新检测结果',
      extraData,
    );

    return updatedInspection;
  }

  async findById(id: string): Promise<InspectionDocument> {
    const inspection = await this.inspectionModel.findById(id).exec();
    if (!inspection) {
      throw new NotFoundException('检测记录不存在');
    }
    return inspection;
  }

  async findByBatteryId(batteryId: string): Promise<InspectionDocument[]> {
    return this.inspectionModel
      .find({ batteryId: new Types.ObjectId(batteryId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findAll(query: QueryInspectionDto): Promise<{ list: InspectionDocument[]; total: number }> {
    const { page = 1, pageSize = 20, ...filters } = query;
    const mongoQuery: any = {};

    if (filters.batteryCode) {
      mongoQuery.batteryCode = { $regex: filters.batteryCode, $options: 'i' };
    }
    if (filters.inspector) {
      mongoQuery.inspector = { $regex: filters.inspector, $options: 'i' };
    }
    if (filters.safetyLevel) {
      mongoQuery.safetyLevel = filters.safetyLevel;
    }
    if (filters.result) {
      mongoQuery.result = filters.result;
    }
    if (filters.startDate || filters.endDate) {
      mongoQuery.inspectionDate = {};
      if (filters.startDate) {
        mongoQuery.inspectionDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        mongoQuery.inspectionDate.$lte = new Date(filters.endDate);
      }
    }

    const [list, total] = await Promise.all([
      this.inspectionModel
        .find(mongoQuery)
        .sort({ inspectionDate: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.inspectionModel.countDocuments(mongoQuery).exec(),
    ]);

    return { list, total };
  }

  async lockInspection(id: string, operator: string): Promise<InspectionDocument> {
    const inspection = await this.findById(id);
    inspection.isLocked = true;
    return inspection.save();
  }

  isSafetyQualified(safetyLevel: SafetyLevel): boolean {
    return safetyLevel === SafetyLevel.A || safetyLevel === SafetyLevel.B;
  }

  async getLatestByBatteryId(batteryId: string): Promise<InspectionDocument | null> {
    return this.inspectionModel
      .findOne({ batteryId: new Types.ObjectId(batteryId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}
