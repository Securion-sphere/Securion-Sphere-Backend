import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  nickName: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @Matches(/^\d{8}@kmitl\.ac\.th$/)
  @Matches(/^[a-zA-Z]+(\.[a-zA-Z]+)?@kmitl\.ac\.th$/)
  email: string;

  @ApiProperty()
  @IsEnum(["student", "supervisor"])
  role: "student" | "supervisor";

  @ApiProperty()
  @IsUrl()
  @IsString()
  @IsOptional()
  profileImg: string;
}
