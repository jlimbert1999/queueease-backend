import { Officer, Service, ServiceDesk } from 'src/management/entities';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';

enum CustomerStatus {
  ATTENDED = 'attended',
  PENDING = 'pending',
  ABSENT = 'absent',
}

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column()
  code: string;

  @CreateDateColumn()
  date: Date;

  @Column({ type: 'enum', enum: CustomerStatus, default: CustomerStatus.PENDING })
  status: string;

  @OneToOne(() => Service)
  @JoinColumn()
  service: Service;

  @OneToOne(() => ServiceDesk)
  @JoinColumn()
  desk: ServiceDesk;

  @OneToOne(() => Officer)
  @JoinColumn()
  officer: Officer;
}
