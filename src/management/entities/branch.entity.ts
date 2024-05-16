import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Service, ServiceCounter } from './';
import { ServiceRequest } from 'src/customer/entities';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Service, (service) => service.branch)
  @JoinTable({ name: 'branch_service' })
  services: Service[];

  @OneToMany(() => ServiceCounter, (serviceDesk) => serviceDesk.branch)
  serviceCounter: ServiceCounter[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.branch)
  serviceRequests: ServiceRequest[];
}
