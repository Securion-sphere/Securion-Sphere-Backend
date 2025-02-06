import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateLabImageDto {
  @ApiProperty({ type: String })
  @IsString()
  image_name: string;

  @ApiProperty({ type: "string", format: "binary" })
  image: Express.Multer.File;
}
