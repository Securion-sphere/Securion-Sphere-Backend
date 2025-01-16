import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsNumber, IsPositive, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class StudentDto {
  @IsNumber()
  @IsPositive()
  @ApiProperty()
  year: number;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @ValidateNested()
  @Type(() => StudentDto)
  student?: StudentDto;
}
