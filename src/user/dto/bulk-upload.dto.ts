// src/user/dto/bulk-upload.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";

export class BulkUploadDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "CSV file containing email addresses",
  })
  file: Express.Multer.File;

  @ApiProperty({
    enum: ["student", "supervisor"],
    default: "student",
    description: "Role to assign to the users",
  })
  @IsEnum(["student", "supervisor"])
  role: "student" | "supervisor";
}
