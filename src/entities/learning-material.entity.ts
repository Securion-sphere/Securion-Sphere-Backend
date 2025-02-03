import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class LearningMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  imageKey?: string;

  @Column({ nullable: true })
  category?: string;

  @Column()
  fileName: string;

  @Column()
  fileKey: string;

  @Column()
  fileType: "pdf" | "md";
}
