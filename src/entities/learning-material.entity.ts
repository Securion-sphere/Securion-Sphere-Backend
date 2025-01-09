import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LearningMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column()
  fileType: "pdf" | "md";
}
