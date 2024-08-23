import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LabImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  name: string;

  @Column({ type: "text", unique: true })
  "image-id": string;
}
