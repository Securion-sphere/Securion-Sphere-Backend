import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl, Matches } from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  nichName: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @Matches(/^\d{8}@kmitl\.ac\.th$/)
  @Matches(/^[a-zA-Z]+(\.[a-zA-Z]+)?@kmitl\.ac\.th$/)
  email: string;

  @ApiProperty()
  @IsUrl()
  @IsString()
  @IsOptional()
  profile_img: string;
}
