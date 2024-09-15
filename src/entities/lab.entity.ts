import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Supervisor } from "./supervisor.entity";

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

  @OneToMany(() => Supervisor, (supervisor) => supervisor.user)
  creator: Supervisor;

  @Column({ type: "boolean", default: false })
  isActive: boolean;
}
