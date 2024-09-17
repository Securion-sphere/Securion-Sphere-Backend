import { ApiProperty } from "@nestjs/swagger";
import { Lab } from "src/entities/lab.entity";
import { User } from "src/entities/user.entity";

export class GetLabInstanceResponseDto {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: User })
  instanceOwner: User;

  @ApiProperty({ type: Lab })
  instanceLab: Lab;

  @ApiProperty({ type: String })
  ip: string;

  @ApiProperty({ type: Number })
  port: number;
}
