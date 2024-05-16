import { Branch, Service, ServiceCounter } from 'src/management/entities';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

export enum CustomerStatus {
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

  @ManyToOne(() => Service, (service) => service.requests, { nullable: false })
  service: Service;

  @ManyToOne(() => Branch, (branch) => branch.serviceRequests, { nullable: false })
  branch: Branch;

  @ManyToOne(() => ServiceCounter, (serviceCounter) => serviceCounter.requests, { nullable: true })
  desk: ServiceCounter;
}
