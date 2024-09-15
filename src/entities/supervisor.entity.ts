import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Lab } from './lab.entity';

@Entity()
export class Supervisor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  created_content: number;

  @OneToMany(() => Lab, (lab) => lab.creator)
  labs: Lab[];
}
