import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { CreateInspectionDto, UpdateInspectionDto, QueryInspectionDto } from './dto/inspection.dto';

@Controller('inspection')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post()
  async create(@Body() dto: CreateInspectionDto) {
    const operator = dto.inspector || 'system';
    const result = await this.inspectionService.create(dto, operator);
    return {
      code: 0,
      message: '检测录入成功',
      data: result,
    };
  }

  @Get()
  async findAll(@Query() query: QueryInspectionDto) {
    const result = await this.inspectionService.findAll(query);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.inspectionService.findById(id);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('battery/:batteryId')
  async findByBatteryId(@Param('batteryId') batteryId: string) {
    const result = await this.inspectionService.findByBatteryId(batteryId);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    const operator = 'system';
    const result = await this.inspectionService.update(id, dto, operator);
    return {
      code: 0,
      message: '更新成功',
      data: result,
    };
  }

  @Put(':id/lock')
  async lockInspection(@Param('id') id: string) {
    const operator = 'system';
    const result = await this.inspectionService.lockInspection(id, operator);
    return {
      code: 0,
      message: '锁定成功',
      data: result,
    };
  }
}
