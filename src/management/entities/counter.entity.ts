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
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Service } from './service.entity';
import { User } from 'src/users/entities/user.entity';

@Entity()
@Index(['number', 'branch'], { unique: true })
@Unique(['user'])
export class Counter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  number: number;

  @ManyToOne(() => Branch, (branch) => branch.counters, { eager: true })
  branch: Branch;

  @OneToOne(() => User, (user) => user.counter, { nullable: true })
  @JoinColumn()
  user?: User;

  @ManyToMany(() => Service, { eager: true })
  @JoinTable()
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  // @OneToMany(() => ServiceRequest, (request) => request.desk)
  // requests: ServiceRequest[];
}
