import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LabImage } from "./lab-image.entity";
import { Solvation } from "./solvation.entity";

@Entity()
export class Lab {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  name: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "smallint" })
  point: number;

  @Column({ type: "text" })
  category: string;

  @OneToOne(() => LabImage, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "lab_image_id" })
  labImage: LabImage;

  @OneToMany(() => Solvation, (solvation) => solvation.lab)
  solvedBy: Solvation[];

  @Column({ type: "boolean", default: false })
  isReady: boolean;
}
