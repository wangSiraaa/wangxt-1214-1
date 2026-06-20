import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FlowEvent, FlowEventSchema } from './schemas/flow-event.schema';
import { FlowService } from './flow.service';
import { FlowController } from './flow.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FlowEvent.name, schema: FlowEventSchema }]),
    forwardRef(() => AuditModule),
  ],
  controllers: [FlowController],
  providers: [FlowService],
  exports: [FlowService],
})
export class FlowModule {}
