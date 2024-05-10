import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { ServiceDesk } from './';

@Entity()
export class Officer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @ManyToMany(() => ServiceDesk, { cascade: true })
  @JoinTable()
  serviceDesks: ServiceDesk[];
}
