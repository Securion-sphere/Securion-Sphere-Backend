// src/user/dto/pre-login-user.dto.ts

import { IsEmail, IsIn } from "class-validator";

export class PreLoginUserDto {
  @IsEmail()
  email: string;

  @IsIn(["student", "supervisor"])
  role: "student" | "supervisor";
}
