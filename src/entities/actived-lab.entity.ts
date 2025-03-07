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
export class ActivedLab {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.activedLab)
  @JoinColumn({ name: "user_id" })
  instanceOwner: User;

  @ManyToOne(() => Lab)
  @JoinColumn({ name: "lab_id" })
  instanceLab: Lab;

  @Column({ name: "container_id" })
  containerId: string;

  @Column()
  ip: string;

  @Column()
  port: number;

  @Column()
  flag: string;
}
