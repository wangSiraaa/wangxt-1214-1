import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SaleOrder, SaleOrderSchema } from './schemas/sale-order.schema';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { BatteryModule } from '../battery/battery.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SaleOrder.name, schema: SaleOrderSchema }]),
    forwardRef(() => BatteryModule),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
