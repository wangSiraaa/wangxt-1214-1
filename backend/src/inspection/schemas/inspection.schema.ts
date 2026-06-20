import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InspectionDocument = Inspection & Document;

export enum InspectionResult {
  QUALIFIED = 'qualified',
  UNQUALIFIED = 'unqualified',
  PENDING = 'pending',
}

export enum SafetyLevel {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

@Schema({ timestamps: true })
export class Inspection {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Battery', index: true })
  batteryId: Types.ObjectId;

  @Prop({ required: true })
  batteryCode: string;

  @Prop({ required: true })
  inspector: string;

  @Prop({ required: true })
  inspectionDate: Date;

  @Prop()
  capacity: number;

  @Prop()
  capacityRatio?: number;

  @Prop()
  internalResistance: number;

  @Prop()
  internalResistanceRatio?: number;

  @Prop({ required: true, enum: SafetyLevel })
  safetyLevel: SafetyLevel;

  @Prop({ type: [String] })
  testItems?: string[];

  @Prop()
  appearanceCheck?: string;

  @Prop()
  voltage?: number;

  @Prop()
  temperature?: number;

  @Prop()
  insulationResistance?: number;

  @Prop({ enum: InspectionResult, default: InspectionResult.PENDING })
  result: InspectionResult;

  @Prop()
  conclusion?: string;

  @Prop()
  suggestRoute?: string;

  @Prop({ default: false })
  isLocked: boolean;

  @Prop({ type: Object })
  extra?: Record<string, any>;
}

export const InspectionSchema = SchemaFactory.createForClass(Inspection);

InspectionSchema.index({ batteryId: 1, createdAt: -1 });
InspectionSchema.index({ safetyLevel: 1 });
InspectionSchema.index({ result: 1 });
InspectionSchema.index({ inspectionDate: -1 });
