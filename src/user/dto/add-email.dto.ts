import { IsArray, IsEmail, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddEmailsDto {
  @ApiProperty({ example: ["61010777@kmitl.ac.th"] })
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];

  @ApiProperty({ enum: ["student", "supervisor"] })
  @IsEnum(["student", "supervisor"])
  role: "student" | "supervisor";
}
