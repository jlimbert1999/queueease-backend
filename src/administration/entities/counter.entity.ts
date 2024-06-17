import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
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

  @Column({ nullable: true })
  ip: string;

  @Column()
  number: number;

  @ManyToOne(() => Branch, (branch) => branch.counters)
  branch: Branch;

  @OneToOne(() => User, (user) => user.counter, { nullable: true })
  @JoinColumn()
  user?: User;

  @ManyToMany(() => Service)
  @JoinTable()
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  branchId: string;

  @BeforeInsert()
  checkIpInsert() {
    this.ip = this.ip.trim();
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.ip = this.ip.trim();
  }
}
