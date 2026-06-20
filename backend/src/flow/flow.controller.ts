import { Controller, Get, Query, Param } from '@nestjs/common';
import { FlowService } from './flow.service';

@Controller('flow')
export class FlowController {
  constructor(private readonly flowService: FlowService) {}

  @Get()
  async getEventList(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('batteryCode') batteryCode?: string,
    @Query('eventType') eventType?: string,
    @Query('operator') operator?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.flowService.getEventList({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      batteryCode,
      eventType,
      operator,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('battery/:batteryId')
  async getBatteryFlowEvents(@Param('batteryId') batteryId: string) {
    const list = await this.flowService.getBatteryFlowEvents(batteryId);
    return {
      code: 0,
      message: 'success',
      data: list,
    };
  }
}
