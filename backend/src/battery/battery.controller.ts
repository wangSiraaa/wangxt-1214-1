import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { BatteryService } from './battery.service';
import { RegisterBatteryDto, UpdateBatteryDto, QueryBatteryDto } from './dto/battery.dto';

@Controller('battery')
export class BatteryController {
  constructor(private readonly batteryService: BatteryService) {}

  @Post('register')
  async register(@Body() dto: RegisterBatteryDto) {
    const operator = dto.receiver || 'system';
    const result = await this.batteryService.register(dto, operator);
    return {
      code: 0,
      message: '登记成功',
      data: result,
    };
  }

  @Get()
  async findAll(@Query() query: QueryBatteryDto) {
    const result = await this.batteryService.findAll(query);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('statistics')
  async getStatistics() {
    const result = await this.batteryService.getStatistics();
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const result = await this.batteryService.findById(id);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const result = await this.batteryService.findByCode(code);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBatteryDto) {
    const operator = 'system';
    const result = await this.batteryService.update(id, dto, operator);
    return {
      code: 0,
      message: '更新成功',
      data: result,
    };
  }
}
