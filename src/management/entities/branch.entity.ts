import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { Service, Counter } from './';
import { ServiceRequest } from 'src/ticketing/entities';

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
