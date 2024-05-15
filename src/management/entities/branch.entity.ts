import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Service, ServiceCounter } from './';

@Entity()
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Service)
  @JoinTable({ name: 'branch_service' })
  services: Service[];

  @OneToMany(() => ServiceCounter, (serviceDesk) => serviceDesk.branch)
  serviceCounter: ServiceCounter[];
}
