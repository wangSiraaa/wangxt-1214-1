import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Battery, BatterySchema } from './schemas/battery.schema';
import { BatteryService } from './battery.service';
import { BatteryController } from './battery.controller';
import { FlowModule } from '../flow/flow.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Battery.name, schema: BatterySchema }]),
    forwardRef(() => FlowModule),
    forwardRef(() => AuditModule),
  ],
  controllers: [BatteryController],
  providers: [BatteryService],
  exports: [BatteryService],
})
export class BatteryModule {}
