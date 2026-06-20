import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { SafetyLevel, InspectionResult } from '../schemas/inspection.schema';

export class CreateInspectionDto {
  @IsString()
  @IsNotEmpty({ message: '电池包ID不能为空' })
  batteryId: string;

  @IsString()
  @IsNotEmpty({ message: '电池包编号不能为空' })
  batteryCode: string;

  @IsString()
  @IsNotEmpty({ message: '检测人员不能为空' })
  inspector: string;

  @IsOptional()
  inspectionDate?: Date;

  @IsNumber()
  @IsNotEmpty({ message: '容量不能为空' })
  capacity: number;

  @IsOptional()
  @IsNumber()
  capacityRatio?: number;

  @IsNumber()
  @IsNotEmpty({ message: '内阻不能为空' })
  internalResistance: number;

  @IsOptional()
  @IsNumber()
  internalResistanceRatio?: number;

  @IsEnum(SafetyLevel, { message: '安全等级必须为 A、B、C、D' })
  @IsNotEmpty({ message: '安全等级不能为空' })
  safetyLevel: SafetyLevel;

  @IsOptional()
  @IsArray()
  testItems?: string[];

  @IsOptional()
  @IsString()
  appearanceCheck?: string;

  @IsOptional()
  @IsNumber()
  voltage?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  insulationResistance?: number;

  @IsOptional()
  @IsString()
  conclusion?: string;

  @IsOptional()
  @IsString()
  suggestRoute?: string;
}

export class UpdateInspectionDto {
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsNumber()
  capacityRatio?: number;

  @IsOptional()
  @IsNumber()
  internalResistance?: number;

  @IsOptional()
  @IsNumber()
  internalResistanceRatio?: number;

  @IsOptional()
  @IsEnum(SafetyLevel)
  safetyLevel?: SafetyLevel;

  @IsOptional()
  @IsArray()
  testItems?: string[];

  @IsOptional()
  @IsString()
  appearanceCheck?: string;

  @IsOptional()
  @IsNumber()
  voltage?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  insulationResistance?: number;

  @IsOptional()
  @IsString()
  conclusion?: string;

  @IsOptional()
  @IsString()
  suggestRoute?: string;
}

export class QueryInspectionDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  @IsString()
  batteryCode?: string;

  @IsOptional()
  @IsString()
  inspector?: string;

  @IsOptional()
  @IsString()
  safetyLevel?: string;

  @IsOptional()
  @IsString()
  result?: string;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;
}
