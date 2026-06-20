import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleOrderDto, UpdateSaleOrderDto, QuerySaleOrderDto } from './dto/sale-order.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  async create(@Body() dto: CreateSaleOrderDto) {
    const operator = dto.salesPerson || 'system';
    const result = await this.salesService.create(dto, operator);
    return {
      code: 0,
      message: '创建成功',
      data: result,
    };
  }

  @Get()
  async findAll(@Query() query: QuerySaleOrderDto) {
    const result = await this.salesService.findAll(query);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('purposes')
  getCascadePurposes() {
    const result = this.salesService.getCascadePurposes();
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('available-batteries')
  async getAvailableBatteries() {
    const result = await this.salesService.getAvailableBatteries();
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.salesService.findById(id);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSaleOrderDto) {
    const operator = 'system';
    const result = await this.salesService.update(id, dto, operator);
    return {
      code: 0,
      message: '更新成功',
      data: result,
    };
  }

  @Put(':id/confirm')
  async confirm(@Param('id') id: string) {
    const operator = 'system';
    const result = await this.salesService.confirm(id, operator);
    return {
      code: 0,
      message: '确认成功',
      data: result,
    };
  }

  @Put(':id/ship')
  async ship(@Param('id') id: string) {
    const operator = 'system';
    const result = await this.salesService.ship(id, operator);
    return {
      code: 0,
      message: '发货成功',
      data: result,
    };
  }

  @Put(':id/complete')
  async complete(@Param('id') id: string) {
    const operator = 'system';
    const result = await this.salesService.complete(id, operator);
    return {
      code: 0,
      message: '完成成功',
      data: result,
    };
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string) {
    const operator = 'system';
    const result = await this.salesService.cancel(id, operator);
    return {
      code: 0,
      message: '取消成功',
      data: result,
    };
  }
}
