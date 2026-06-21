import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BatteryDocument = Battery & Document;

export enum BatteryStatus {
  PENDING_VIN = 'pending_vin',
  REGISTERED = 'registered',
  INSPECTING = 'inspecting',
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  DISASSEMBLING = 'disassembling',
  FOR_SALE = 'for_sale',
  SOLD = 'sold',
  SHIPPED = 'shipped',
}

export enum SafetyLevel {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

@Schema({ timestamps: true })
export class Battery {
  @Prop({ required: true, unique: true, index: true })
  batteryCode: string;

  @Prop()
  vin?: string;

  @Prop()
  vehiclePlate?: string;

  @Prop()
  vehicleModel?: string;

  @Prop()
  batteryModel?: string;

  @Prop()
  nominalCapacity?: number;

  @Prop()
  nominalVoltage?: number;

  @Prop({ required: true, enum: BatteryStatus, default: BatteryStatus.REGISTERED })
  status: BatteryStatus;

  @Prop()
  receiver: string;

  @Prop()
  receiveDate: Date;

  @Prop()
  packageCount?: number;

  @Prop()
  weight?: number;

  @Prop()
  remark?: string;

  @Prop()
  capacity?: number;

  @Prop()
  internalResistance?: number;

  @Prop({ enum: SafetyLevel })
  safetyLevel?: SafetyLevel;

  @Prop()
  inspector?: string;

  @Prop()
  inspectionDate?: Date;

  @Prop()
  cascadePurpose?: string;

  @Prop()
  customerName?: string;

  @Prop()
  saleDate?: Date;

  @Prop()
  salesPerson?: string;

  @Prop({ default: false })
  isInspectionLocked: boolean;

  @Prop({ type: Object })
  extra?: Record<string, any>;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BatterySchema = SchemaFactory.createForClass(Battery);

BatterySchema.index({ vin: 1 });
BatterySchema.index({ status: 1 });
BatterySchema.index({ safetyLevel: 1 });
BatterySchema.index({ createdAt: -1 });
