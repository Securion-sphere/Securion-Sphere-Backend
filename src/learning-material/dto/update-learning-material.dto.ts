import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional } from "class-validator";

export class UpdateLearningMaterialDto {
  @ApiPropertyOptional({ description: "Title of the learning material" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: "Description of the learning material" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: "string", format: "binary" })
  @IsOptional()
  image?: Express.Multer.File;

  @ApiPropertyOptional({ type: "string", format: "binary" })
  @IsOptional()
  file?: Express.Multer.File;
}
