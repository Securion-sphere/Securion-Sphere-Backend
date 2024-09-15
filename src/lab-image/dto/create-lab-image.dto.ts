import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateLabImageDto {
  @ApiProperty({ type: String })
  @IsString()
  name: string;

  @ApiProperty({ type: String })
  @IsString()
  image_id: string;
}
