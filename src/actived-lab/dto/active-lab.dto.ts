import { IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateLabInstanceDto {
  @ApiProperty({ type: Number })
  @IsInt()
  labId: number;

  @ApiProperty({ type: Number })
  @IsInt()
  userId: number;
}
