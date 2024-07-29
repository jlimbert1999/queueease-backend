import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { Branch, Category } from './';
import { ServiceRequest } from 'src/modules/ticketing/entities';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;
}
