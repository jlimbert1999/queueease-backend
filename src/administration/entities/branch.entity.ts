import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany } from 'typeorm';
import { ServiceRequest } from 'src/ticketing/entities';
import { Service, Counter, BranchVideo } from './';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  marqueeMessage: string;

  @OneToMany(() => BranchVideo, (branchVideo) => branchVideo.branch, { cascade: true })
  videos: BranchVideo[];

  @ManyToMany(() => Service, (service) => service.branches)
  services: Service[];

  @OneToMany(() => Counter, (counter) => counter.branch)
  counters: Counter[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.branch)
  serviceRequests: ServiceRequest[];

  @Column({ nullable: true })
  alertVideoUrl?: string;
}
