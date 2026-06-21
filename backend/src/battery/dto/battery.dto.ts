import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDate, IsEnum } from 'class-validator';

export enum SaveMode {
  REGISTER = 'register',
  PENDING_VIN = 'pending_vin',
}

export class RegisterBatteryDto {
  @IsString()
  @IsNotEmpty({ message: '电池包编号不能为空' })
  batteryCode: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsEnum(SaveMode, { message: '保存模式无效' })
  saveMode?: SaveMode;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsString()
  batteryModel?: string;

  @IsOptional()
  @IsNumber()
  nominalCapacity?: number;

  @IsOptional()
  @IsNumber()
  nominalVoltage?: number;

  @IsOptional()
  @IsString()
  receiver?: string;

  @IsOptional()
  receiveDate?: Date;

  @IsOptional()
  @IsNumber()
  packageCount?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class SupplementVinDto {
  @IsString()
  @IsNotEmpty({ message: 'VIN码不能为空' })
  vin: string;
}

export class UpdateBatteryDto {
  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @IsOptional()
  @IsString()
  vehicleModel?: string;

  @IsOptional()
  @IsString()
  batteryModel?: string;

  @IsOptional()
  @IsNumber()
  nominalCapacity?: number;

  @IsOptional()
  @IsNumber()
  nominalVoltage?: number;

  @IsOptional()
  @IsNumber()
  packageCount?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  remark?: string;
}

export class QueryBatteryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  @IsString()
  batteryCode?: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  safetyLevel?: string;

  @IsOptional()
  @IsString()
  receiver?: string;

  @IsOptional()
  @IsString()
  vehiclePlate?: string;
}
