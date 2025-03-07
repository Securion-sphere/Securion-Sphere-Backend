import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LabImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "image_name", type: "text", unique: true })
  imageName: string;

  @Column({ name: "image_id", type: "text", unique: true })
  imageId: string;
}
