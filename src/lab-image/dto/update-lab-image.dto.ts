import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateLabImageDto } from "./create-lab-image.dto";

export class UpdateLabImageDto extends PartialType(
  OmitType(CreateLabImageDto, ["file"] as const),
) {}
