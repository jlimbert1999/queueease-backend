import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, OneToOne } from 'typeorm';
import { Attention } from './attention.entity';
import { Branch, Preference, Service } from 'src/modules/administration/entities';

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

  @Column()
  code: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ type: 'int' })
  priority: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Service, (service) => service.serviceRequests)
  service: Service;

  @ManyToOne(() => Branch, (branch) => branch.serviceRequests)
  branch: Branch;

  @ManyToOne(() => Preference, (preference) => preference.requests)
  preference: Preference;

  @OneToOne(() => Attention, (attention) => attention.request)
  attention: Attention;

  @Column({ nullable: true })
  branchId: string;

  @Column({ nullable: true })
  serviceId: string;
}
