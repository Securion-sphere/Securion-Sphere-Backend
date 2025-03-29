import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { CreateLabDto } from "./create-lab.dto";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateLabDto extends PartialType(
  OmitType(CreateLabDto, ["labImageId"] as const),
) {
  @ApiProperty({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  isReady: boolean;
}
