import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class SubmitFlagDto {
  @ApiProperty({ type: String })
  @IsString()
  flag: string;
}
