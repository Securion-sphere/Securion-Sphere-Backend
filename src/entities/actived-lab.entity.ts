import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Lab } from "./lab.entity";

@Entity()
export class ActivatedLab {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.actived_machine)
  @JoinColumn()
  instanceOwner: User;

  @ManyToOne(() => Lab, (lab) => lab.id)
  instanceLab: Lab;

  @Column()
  ip: string;

  @Column()
  port: number;

  @Column()
  flag: string;
}
