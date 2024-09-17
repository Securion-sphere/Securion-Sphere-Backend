import { IsInt, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class SubmitFlagDto {
  @ApiProperty({ type: Number })
  @IsInt()
  userId: number;

  @ApiProperty({ type: String })
  @IsString()
  flag: string;
}
