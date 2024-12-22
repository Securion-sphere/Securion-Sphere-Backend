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

  @OneToOne(() => User, (user) => user.activate_lab)
  @JoinColumn()
  instanceOwner: User;

  @ManyToOne(() => Lab, (lab) => lab.id)
  instanceLab: Lab;

  @Column()
  containerId: string;

  @Column()
  ip: string;

  @Column()
  port: number;

  @Column()
  flag: string;
}
