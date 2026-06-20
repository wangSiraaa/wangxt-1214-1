import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDate } from 'class-validator';

export class RegisterBatteryDto {
  @IsString()
  @IsNotEmpty({ message: '电池包编号不能为空' })
  batteryCode: string;

  @IsString()
  @IsNotEmpty({ message: 'VIN码不能为空' })
  vin: string;

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

export class UpdateBatteryDto {
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
