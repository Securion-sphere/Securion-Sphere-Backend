import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class PreLoginUser {
  @PrimaryColumn({ unique: true })
  email: string;

  @Column({ type: "enum", enum: ["student", "supervisor"], default: "student" })
  role: "student" | "supervisor";
}
