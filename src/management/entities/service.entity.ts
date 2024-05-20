import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ServiceRequest } from 'src/customer/entities';
import { Branch, Category } from './';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @ManyToMany(() => Branch, (branch) => branch.services)
  @JoinTable()
  branches: Branch[];

  @ManyToOne(() => Category, (category) => category.services, { nullable: true })
  category?: Category;

  @OneToMany(() => ServiceRequest, (request) => request.service)
  serviceRequests: ServiceRequest[];
}
