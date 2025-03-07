// src/user/dto/pre-login-user.dto.ts

import { IsEmail, IsIn, IsOptional } from "class-validator";

export class PreLoginUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(["student", "supervisor"])
  role: "student" | "supervisor" = "student";
}
