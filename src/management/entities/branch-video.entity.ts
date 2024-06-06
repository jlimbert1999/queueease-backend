import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch.entity';


@Entity()
export class BranchVideo {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => Branch, (branch) => branch.videos, { onDelete: 'CASCADE' })
  branch: Branch;
}
