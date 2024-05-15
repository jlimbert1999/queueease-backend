import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Service } from './service.entity';
import { User } from 'src/users/entities/user.entity';
import { ServiceRequest } from 'src/customer/entities';

@Entity()
@Index(['number', 'branch'], { unique: true })
export class ServiceCounter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  number: number;

  @ManyToOne(() => Branch, (branch) => branch.serviceCounter, { eager: true })
  branch: Branch;

  @ManyToMany(() => Service, { eager: true })
  @JoinTable()
  services: Service[];

  @OneToOne(() => User, { nullable: true })
  @JoinColumn()
  user?: User;

  @OneToMany(() => ServiceRequest, (request) => request.desk) // note: we will create author property in the Photo class below
  requests: ServiceRequest[];
}
