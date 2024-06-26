import { Branch, Service, Counter } from 'src/administration/entities';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';

export enum RequestStatus {
  ATTENDED = 'attended',
  PENDING = 'pending',
  ABSENT = 'absent',
  SERVICING = 'servicing',
}

@Entity()
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column()
  code: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: string;

  @ManyToOne(() => Service, (service) => service.serviceRequests)
  service: Service;

  @ManyToOne(() => Branch, (branch) => branch.serviceRequests)
  branch: Branch;

  @ManyToOne(() => Counter, { nullable: true, eager: true })
  counter?: Counter;

  @Column({ nullable: true })
  branchId: string;

  @Column({ nullable: true })
  serviceId: string;
}
