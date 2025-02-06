import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Lab } from "./lab.entity";

@Entity()
export class LabImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  image_name: string;

  @Column({ type: "text", unique: true })
  image_id: string;

  @OneToMany(() => Lab, (lab) => lab["image-id"])
  lab_used: Lab[];
}
