import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Solvation } from "./solvation.entity";

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Solvation, (solvation) => solvation.student)
  solved_lab: Solvation[];

  @Column({ nullable: true })
  year: number;
}
