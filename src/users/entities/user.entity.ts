import { Counter } from 'src/management/entities';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  OFFICER = 'officer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToOne(() => Counter, (counter) => counter.user, { nullable: true })
  counter?: Counter;

  @CreateDateColumn()
  createdAt: Date;
}
