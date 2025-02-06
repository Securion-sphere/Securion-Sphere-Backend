import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateLabDto } from "./create-lab.dto";
import { IsNumber } from "class-validator";

export class UpdateLabDto extends PartialType(CreateLabDto) {
  @ApiProperty({ type: Number })
  @IsNumber()
  creatorId: number;
}
