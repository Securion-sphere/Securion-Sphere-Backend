import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Supervisor } from "./supervisor.entity";
import { LabImage } from "./lab-image.entity";

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

  @ManyToOne(() => LabImage, (labImage) => labImage["image-id"])
  labImage: LabImage;

  @Column({ type: "boolean", default: false })
  isActive: boolean;
}
