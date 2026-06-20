import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('battery')
  async getBatteryAuditList(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('batteryCode') batteryCode?: string,
    @Query('status') status?: string,
    @Query('safetyLevel') safetyLevel?: string,
    @Query('vin') vin?: string,
  ) {
    const result = await this.auditService.getBatteryAuditList({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      batteryCode,
      status,
      safetyLevel,
      vin,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  @Get('flow-events')
  async getFlowEventAuditList(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('batteryCode') batteryCode?: string,
    @Query('eventType') eventType?: string,
    @Query('operator') operator?: string,
  ) {
    const result = await this.auditService.getFlowEventAuditList({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      batteryCode,
      eventType,
      operator,
    });
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }
}
