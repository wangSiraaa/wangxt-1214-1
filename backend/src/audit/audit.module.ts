import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatteryAuditIndex } from './entities/battery-audit-index.entity';
import { FlowEventAudit } from './entities/flow-event-audit.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { FlowModule } from '../flow/flow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BatteryAuditIndex, FlowEventAudit]),
    forwardRef(() => FlowModule),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
