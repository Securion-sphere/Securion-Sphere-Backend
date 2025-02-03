import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Lab } from "./lab.entity";
import { Supervisor } from "./supervisor.entity";

@Entity()
export class LabImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  image_name: string;

  @OneToMany(() => Lab, (lab) => lab["image-id"])
  lab_used: Lab[];

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.imageLabs)
  owner: Supervisor;
}
