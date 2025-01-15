import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateLabImageDto {
  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: "string", format: "binary" })
  file: Express.Multer.File;
}
