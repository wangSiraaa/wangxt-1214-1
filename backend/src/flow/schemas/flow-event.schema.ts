import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlowEventDocument = FlowEvent & Document;

export enum FlowEventType {
  REGISTER = 'register',
  INSPECTION_START = 'inspection_start',
  INSPECTION_COMPLETE = 'inspection_complete',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  TO_DISASSEMBLE = 'to_disassemble',
  FOR_SALE = 'for_sale',
  SOLD = 'sold',
  SHIPPED = 'shipped',
  MODIFY = 'modify',
  LOCK_INSPECTION = 'lock_inspection',
}

@Schema({ timestamps: true })
export class FlowEvent {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Battery', index: true })
  batteryId: Types.ObjectId;

  @Prop({ required: true })
  batteryCode: string;

  @Prop({ required: true, enum: FlowEventType })
  eventType: FlowEventType;

  @Prop()
  fromStatus?: string;

  @Prop()
  toStatus?: string;

  @Prop()
  operator: string;

  @Prop()
  operationTime: Date;

  @Prop()
  remark?: string;

  @Prop({ type: Object })
  beforeData?: Record<string, any>;

  @Prop({ type: Object })
  afterData?: Record<string, any>;

  @Prop({ default: false })
  syncedToAudit: boolean;

  @Prop()
  auditSyncTime?: Date;
}

export const FlowEventSchema = SchemaFactory.createForClass(FlowEvent);

FlowEventSchema.index({ batteryId: 1, createdAt: -1 });
FlowEventSchema.index({ eventType: 1 });
FlowEventSchema.index({ createdAt: -1 });
FlowEventSchema.index({ syncedToAudit: 1 });
