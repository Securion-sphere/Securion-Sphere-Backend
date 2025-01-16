import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class AssignStudentDto {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  year: number;
}
