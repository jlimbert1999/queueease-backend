import { ServiceCounter } from 'src/management/entities';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  OFFICER = 'officer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.OFFICER],
  })
  roles: UserRole[];

  @Column({ unique: true })
  login: string;

  @Column()
  password: string;

  @OneToOne(() => ServiceCounter, (serviceCounter) => serviceCounter.user, { nullable: true })
  serviceCounter: ServiceCounter | null;
}
