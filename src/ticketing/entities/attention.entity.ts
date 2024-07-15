// attention.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Counter } from 'src/administration/entities';
import { ServiceRequest } from './service-request.entity';

@Entity()
export class Attention {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Counter, (counter) => counter.attentions)
  counter: Counter;

  @OneToOne(() => ServiceRequest)
  @JoinColumn()
  request: ServiceRequest;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;
}
