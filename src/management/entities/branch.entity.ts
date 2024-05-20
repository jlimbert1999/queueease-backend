import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { ServiceRequest } from 'src/customer/entities';
import { Service, Counter } from './';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Service, (service) => service.branches)
  services: Service[];

  @OneToMany(() => Counter, (counter) => counter.branch)
  counters: Counter[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.branch)
  serviceRequests: ServiceRequest[];
}
