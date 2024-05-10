import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, Index } from 'typeorm';
import { Branch } from './branch.entity';
import { Service } from './service.entity';

@Entity()
@Index(['number', 'branch'], { unique: true })
export class ServiceDesk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  number: number;

  @Column()
  login: string;

  @Column()
  password: string;

  @ManyToOne(() => Branch, (branch) => branch.serviceDesk, { eager: true })
  branch: Branch;

  @ManyToMany(() => Service, { eager: true })
  @JoinTable()
  services: Service[];
}
