import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
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

  @ManyToOne(() => Category, (category) => category.services, { nullable: true })
  category?: Category;

  @OneToMany(() => ServiceRequest, (request) => request.service)
  requests: ServiceRequest;

  @ManyToMany(() => Branch, (branch) => branch.services)
  branch: Branch[];
}
