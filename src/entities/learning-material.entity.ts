import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class LearningMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ name: "image_key", type: "varchar", length: 255, nullable: true })
  imageKey: string | null;

  @Column({ nullable: true })
  category: string | null;

  @Column({ name: "file_name", type: "varchar", length: 255 })
  fileName: string;

  @Column({ name: "file_key", type: "varchar", length: 255, unique: true })
  fileKey: string;

  @Column({
    name: "file_type",
    type: "enum",
    enum: ["pdf", "md"],
    nullable: true,
  })
  fileType: "pdf" | "md" | null;
}
