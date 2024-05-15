import { Service, ServiceCounter } from 'src/management/entities';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

enum CustomerStatus {
  ATTENDED = 'attended',
  PENDING = 'pending',
  ABSENT = 'absent',
}

@Entity()
export class ServiceRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column()
  code: string;

  @CreateDateColumn()
  date: Date;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.PENDING })
  status: string;

  @ManyToOne(() => Service, (service) => service.requests, { nullable: true })
  service: Service;

  @ManyToOne(() => ServiceCounter, (serviceCounter) => serviceCounter.requests, { nullable: true })
  desk: ServiceCounter;
}
