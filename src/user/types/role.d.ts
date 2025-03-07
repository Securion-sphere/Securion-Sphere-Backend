import { User } from "src/entities/user.entity";

export type Role = {
  role: "supervisor" | "student";
  user: User;
};
