import { IsBoolean, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger'
export class CreateLabDto {

    @ApiProperty({ type: String})
    @IsString()
    name: string;

    @ApiProperty({ type: String})
    @IsString()
    description: string;

    @ApiProperty({ type: Number})
    @IsNumber()
    point: number;
    
    @ApiProperty({ type: String})
    @IsString()
    category: string;    
    
    @ApiProperty({ type: Number})
    @IsNumber()
    creatorId: number;

    @ApiProperty({ type: Boolean})
    @IsBoolean()
    isActive?: boolean;
}
