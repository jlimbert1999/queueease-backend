import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
