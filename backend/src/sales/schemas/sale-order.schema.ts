import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleOrderDocument = SaleOrder & Document;

export enum SaleOrderStatus {
  DRAFT = 'draft',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CascadePurpose {
  ENERGY_STORAGE = 'energy_storage',
  LOW_SPEED_EV = 'low_speed_ev',
  COMMUNICATION_BASE = 'communication_base',
  UPS = 'ups',
  SOLAR_STREET_LAMP = 'solar_street_lamp',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class SaleOrder {
  @Prop({ required: true, unique: true })
  orderNo: string;

  @Prop({ required: true })
  customerName: string;

  @Prop()
  customerContact?: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  customerAddress?: string;

  @Prop({ required: true, enum: CascadePurpose })
  cascadePurpose: CascadePurpose;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Battery' }] })
  batteryIds: Types.ObjectId[];

  @Prop({ type: [{ batteryCode: String, capacity: Number, safetyLevel: String }] })
  batteryList: {
    batteryCode: string;
    capacity?: number;
    safetyLevel?: string;
  }[];

  @Prop()
  totalQuantity?: number;

  @Prop({ type: Number })
  totalAmount?: number;

  @Prop()
  salesPerson: string;

  @Prop()
  saleDate?: Date;

  @Prop({ required: true, enum: SaleOrderStatus, default: SaleOrderStatus.DRAFT })
  status: SaleOrderStatus;

  @Prop()
  remark?: string;

  @Prop()
  shippingDate?: Date;

  @Prop()
  shippingAddress?: string;

  @Prop({ type: Object })
  extra?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SaleOrderSchema = SchemaFactory.createForClass(SaleOrder);

SaleOrderSchema.index({ orderNo: 1 });
SaleOrderSchema.index({ status: 1 });
SaleOrderSchema.index({ customerName: 1 });
SaleOrderSchema.index({ createdAt: -1 });
