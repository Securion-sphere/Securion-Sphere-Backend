import { Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Supervisor {
  @PrimaryColumn({ type: "int", nullable: false })
  user_id: number;

  @OneToOne(() => User, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user: User;
}
