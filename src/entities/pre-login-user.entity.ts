import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class PreLoginUser {
  @PrimaryColumn()
  email: string;

  @Column()
  role: "student" | "supervisor";
}
