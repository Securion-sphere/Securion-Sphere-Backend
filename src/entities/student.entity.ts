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
  @PrimaryColumn({ type: "int", nullable: false })
  user_id: number;

  @OneToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Solvation, (solvation) => solvation.student)
  solved_lab: Solvation[];
}
