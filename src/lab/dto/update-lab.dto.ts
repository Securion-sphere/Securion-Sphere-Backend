<<<<<<< HEAD
import { OmitType, PartialType } from "@nestjs/swagger";
=======
import { ApiProperty, PartialType } from "@nestjs/swagger";
>>>>>>> origin/dev
import { CreateLabDto } from "./create-lab.dto";
import { IsNumber } from "class-validator";

<<<<<<< HEAD
export class UpdateLabDto extends PartialType(
  OmitType(CreateLabDto, ["lab_image_id"] as const),
) {}
=======
export class UpdateLabDto extends PartialType(CreateLabDto) {
  @ApiProperty({ type: Number })
  @IsNumber()
  creatorId: number;
}
>>>>>>> origin/dev
