import { ServiceRequest } from 'src/ticketing/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Preference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  acronym: string;

  @Column({ type: 'int' })
  priority: number;

  @OneToMany(() => ServiceRequest, (request) => request.preference)
  requests: ServiceRequest[];

  @Column({ default: true })
  active: boolean;
}
