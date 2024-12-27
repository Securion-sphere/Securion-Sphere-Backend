// dto/download-file.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DownloadFileDto {
  @ApiProperty()
  @IsString()
  filename: string;
}
