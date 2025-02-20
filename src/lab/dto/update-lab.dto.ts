import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateLabDto } from "./create-lab.dto";

export class UpdateLabDto extends PartialType(
  OmitType(CreateLabDto, ["lab_image_id"] as const),
) {}
