import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('battery_audit_index')
@Index(['batteryCode'], { unique: true })
@Index(['status'])
@Index(['safetyLevel'])
@Index(['vin'])
export class BatteryAuditIndex {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'battery_code', length: 100 })
  batteryCode: string;

  @Column({ name: 'mongo_battery_id', length: 50, nullable: true })
  mongoBatteryId: string;

  @Column({ length: 50, nullable: true })
  vin: string;

  @Column({ name: 'vehicle_plate', length: 50, nullable: true })
  vehiclePlate: string;

  @Column({ length: 100, nullable: true })
  status: string;

  @Column({ name: 'safety_level', length: 10, nullable: true })
  safetyLevel: string;

  @Column({ name: 'capacity', type: 'decimal', precision: 10, scale: 2, nullable: true })
  capacity: number;

  @Column({ name: 'internal_resistance', type: 'decimal', precision: 10, scale: 4, nullable: true })
  internalResistance: number;

  @Column({ name: 'receiver', length: 100, nullable: true })
  receiver: string;

  @Column({ name: 'receive_date', type: 'timestamp', nullable: true })
  receiveDate: Date;

  @Column({ name: 'inspector', length: 100, nullable: true })
  inspector: string;

  @Column({ name: 'inspection_date', type: 'timestamp', nullable: true })
  inspectionDate: Date;

  @Column({ name: 'cascade_purpose', length: 200, nullable: true })
  cascadePurpose: string;

  @Column({ name: 'customer_name', length: 200, nullable: true })
  customerName: string;

  @Column({ name: 'sales_person', length: 100, nullable: true })
  salesPerson: string;

  @Column({ name: 'sale_date', type: 'timestamp', nullable: true })
  saleDate: Date;

  @Column({ name: 'is_inspection_locked', default: false })
  isInspectionLocked: boolean;

  @Column({ name: 'current_event_type', length: 50, nullable: true })
  currentEventType: string;

  @Column({ name: 'last_operator', length: 100, nullable: true })
  lastOperator: string;

  @Column({ name: 'last_operation_time', type: 'timestamp', nullable: true })
  lastOperationTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
