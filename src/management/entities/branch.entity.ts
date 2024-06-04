import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, CreateDateColumn } from 'typeorm';
import { ServiceRequest } from 'src/ticketing/entities';
import { Service, Counter } from './';

export enum VideoPlatform {
  LOCAL = 'Local',
  YOUTUBE = 'YouTube',
  FACEBOOK = 'Facebook',
}

@Entity()
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  videoUrl: string;

  @Column()
  videoPlatform: string;

  @Column()
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
