import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Supervisor } from "./supervisor.entity";
import { LabImage } from "./lab-image.entity";
import { User } from "./user.entity";

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

  @ManyToOne(() => Supervisor, (supervisor) => supervisor.labs)
  creator: Supervisor;

  @ManyToOne(() => LabImage, (labImage) => labImage.image_id)
  labImage: LabImage;

  @ManyToMany(() => User)
  solved_by: User[];

  @Column({ type: "boolean", default: false })
  isActive: boolean;
}
