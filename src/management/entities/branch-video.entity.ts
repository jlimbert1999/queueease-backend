import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch.entity';
export enum VideoPlatform {
  LOCAL = 'Local',
  YOUTUBE = 'YouTube',
  FACEBOOK = 'Facebook',
}

@Entity()
export class BranchVideo {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: VideoPlatform })
  platform: VideoPlatform;

  @ManyToOne(() => Branch, (branch) => branch.videos, { onDelete: 'CASCADE' })
  branch: Branch;
}
