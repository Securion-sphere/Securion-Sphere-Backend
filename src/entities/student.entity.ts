import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Solvation } from "./solvation.entity";

@Entity()
export class Student {
  @PrimaryColumn({ name: "user_id", type: "int", nullable: false })
  userId: number;

  @OneToOne(() => User, (user) => user.student, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Solvation, (solvation) => solvation.student)
  solvedLab: Solvation[];
}
