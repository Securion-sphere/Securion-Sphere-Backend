import { IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class DeleteLabInstanceDto {
  @ApiProperty({ type: Number })
  @IsInt()
  userId: number;
}
