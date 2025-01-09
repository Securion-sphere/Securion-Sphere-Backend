import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateLearningMaterialDto {
  @ApiProperty({ description: "Title of the learning material" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Description of the learning material" })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ type: "string", format: "binary" })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
