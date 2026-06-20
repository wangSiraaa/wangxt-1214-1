import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BatteryModule } from './battery/battery.module';
import { InspectionModule } from './inspection/inspection.module';
import { SalesModule } from './sales/sales.module';
import { FlowModule } from './flow/flow.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:21514/battery_recycle?authSource=admin'),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 23514,
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres123',
      database: process.env.POSTGRES_DB || 'battery_audit',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    BatteryModule,
    InspectionModule,
    SalesModule,
    FlowModule,
    AuditModule,
  ],
})
export class AppModule {}
