import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber } from 'class-validator';
import { CascadePurpose } from '../schemas/sale-order.schema';

export class CreateSaleOrderDto {
  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  customerContact?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsEnum(CascadePurpose, { message: '梯次用途不合法' })
  @IsNotEmpty({ message: '梯次用途不能为空' })
  cascadePurpose: CascadePurpose;

  @IsArray()
  @IsNotEmpty({ message: '请选择电池包' })
  batteryIds: string[];

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsString()
  salesPerson: string;

  @IsOptional()
  saleDate?: Date;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}

export class UpdateSaleOrderDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerContact?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsOptional()
  @IsEnum(CascadePurpose)
  cascadePurpose?: CascadePurpose;

  @IsOptional()
  @IsArray()
  batteryIds?: string[];

  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsString()
  shippingAddress?: string;
}

export class QuerySaleOrderDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  @IsString()
  orderNo?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cascadePurpose?: string;

  @IsOptional()
  @IsString()
  salesPerson?: string;
}
