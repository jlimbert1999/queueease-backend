import { Attention } from 'src/modules/ticketing/entities';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';

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

  @Column({ nullable: true })
  jobtitle: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Attention, (attention) => attention.user, { cascade: true })
  attentions: Attention[];
}
