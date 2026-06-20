import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('flow_event_audit')
@Index(['batteryCode'])
@Index(['eventType'])
@Index(['eventTime'])
@Index(['operator'])
export class FlowEventAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'battery_code', length: 100 })
  batteryCode: string;

  @Column({ name: 'mongo_battery_id', length: 50, nullable: true })
  mongoBatteryId: string;

  @Column({ name: 'mongo_event_id', length: 50, nullable: true })
  mongoEventId: string;

  @Column({ name: 'event_type', length: 50 })
  eventType: string;

  @Column({ name: 'from_status', length: 50, nullable: true })
  fromStatus: string;

  @Column({ name: 'to_status', length: 50, nullable: true })
  toStatus: string;

  @Column({ length: 100, nullable: true })
  operator: string;

  @Column({ name: 'event_time', type: 'timestamp' })
  eventTime: Date;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ name: 'before_data', type: 'json', nullable: true })
  beforeData: Record<string, any>;

  @Column({ name: 'after_data', type: 'json', nullable: true })
  afterData: Record<string, any>;

  @CreateDateColumn({ name: 'synced_at' })
  syncedAt: Date;
}
