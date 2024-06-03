import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, CreateDateColumn } from 'typeorm';
import { Service, Counter } from './';
import { ServiceRequest } from 'src/ticketing/entities';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true })
  videoPlatform: string;

  @Column({ nullable: true })
  marqueeMessage: string;

  @ManyToMany(() => Service, (service) => service.branches)
  services: Service[];

  @OneToMany(() => Counter, (counter) => counter.branch)
  counters: Counter[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.branch)
  serviceRequests: ServiceRequest[];

  @CreateDateColumn()
  createdAt: Date;
}
