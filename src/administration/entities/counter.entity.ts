import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Service } from './service.entity';
import { Attention } from 'src/ticketing/entities';

@Entity()
@Index(['number', 'branch'], { unique: true })
export class Counter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  ip: string;

  @Column()
  number: number;

  @ManyToOne(() => Branch, (branch) => branch.counters)
  branch: Branch;

  @ManyToMany(() => Service)
  @JoinTable()
  services: Service[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  branchId: string;

  @OneToMany(() => Attention, (attention) => attention.request, { cascade: true })
  attentions: Attention[];

  @BeforeInsert()
  checkIpInsert() {
    this.ip = this.ip.trim();
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.ip = this.ip.trim();
  }
}
