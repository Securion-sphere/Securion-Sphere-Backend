import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Supervisor {
  @PrimaryColumn({ name: "user_id", type: "int", nullable: false })
  userId: number;

  @OneToOne(() => User, (user) => user.supervisor, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;
}
