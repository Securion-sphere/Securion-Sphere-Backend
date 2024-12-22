import { User } from "src/entities/user.entity";

export type Role = {
  role: "Supervisor" | "Student";
  user: User;
};
