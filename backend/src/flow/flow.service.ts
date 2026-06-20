import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FlowEvent, FlowEventDocument, FlowEventType } from './schemas/flow-event.schema';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class FlowService {
  constructor(
    @InjectModel(FlowEvent.name) private flowEventModel: Model<FlowEventDocument>,
    @Inject(forwardRef(() => AuditService))
    private auditService: AuditService,
  ) {}

  async recordEvent(
    batteryId: Types.ObjectId,
    batteryCode: string,
    eventType: FlowEventType,
    operator: string,
    options: {
      fromStatus?: string;
      toStatus?: string;
      remark?: string;
      beforeData?: Record<string, any>;
      afterData?: Record<string, any>;
    } = {},
  ): Promise<FlowEventDocument> {
    const event = new this.flowEventModel({
      batteryId,
      batteryCode,
      eventType,
      fromStatus: options.fromStatus,
      toStatus: options.toStatus,
      operator,
      operationTime: new Date(),
      remark: options.remark,
      beforeData: options.beforeData,
      afterData: options.afterData,
      syncedToAudit: false,
    });

    const savedEvent = await event.save();

    try {
      await this.auditService.syncFlowEvent(savedEvent);
      savedEvent.syncedToAudit = true;
      savedEvent.auditSyncTime = new Date();
      await savedEvent.save();
    } catch (error) {
      console.error('Failed to sync flow event to audit:', error);
    }

    return savedEvent;
  }

  async getBatteryFlowEvents(batteryId: string): Promise<FlowEventDocument[]> {
    return this.flowEventModel
      .find({ batteryId: new Types.ObjectId(batteryId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getEventList(params: {
    page?: number;
    pageSize?: number;
    batteryCode?: string;
    eventType?: string;
    operator?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ list: FlowEventDocument[]; total: number }> {
    const { page = 1, pageSize = 20, ...filters } = params;
    const query: any = {};

    if (filters.batteryCode) {
      query.batteryCode = { $regex: filters.batteryCode, $options: 'i' };
    }
    if (filters.eventType) {
      query.eventType = filters.eventType;
    }
    if (filters.operator) {
      query.operator = { $regex: filters.operator, $options: 'i' };
    }
    if (filters.startDate || filters.endDate) {
      query.operationTime = {};
      if (filters.startDate) {
        query.operationTime.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.operationTime.$lte = filters.endDate;
      }
    }

    const [list, total] = await Promise.all([
      this.flowEventModel
        .find(query)
        .sort({ operationTime: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .exec(),
      this.flowEventModel.countDocuments(query).exec(),
    ]);

    return { list, total };
  }

  async getUnsyncedEvents(limit: number = 100): Promise<FlowEventDocument[]> {
    return this.flowEventModel
      .find({ syncedToAudit: false })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async markAsSynced(eventId: Types.ObjectId): Promise<void> {
    await this.flowEventModel
      .findByIdAndUpdate(eventId, {
        syncedToAudit: true,
        auditSyncTime: new Date(),
      })
      .exec();
  }
}
