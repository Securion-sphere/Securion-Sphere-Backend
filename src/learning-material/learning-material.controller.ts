import { Controller, Get, Post, UploadedFile, UseInterceptors, StreamableFile, NotFoundException, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LearningMaterialService } from './learning-material.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('learning-material')
@ApiTags("learning-material")
export class LearningMaterialController {
  constructor(
    private readonly learningMaterialService: LearningMaterialService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/Form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.learningMaterialService.uploadFile(file);
  }

  @Get(':filename')
  async downloadFile(@Param('filename') filename: string): Promise<StreamableFile> {
    const fileStream = await this.learningMaterialService.getFile(filename);

    if (!fileStream) {
      throw new NotFoundException('File not found');
    }

    return new StreamableFile(fileStream, {
      type: 'application/octet-stream',
      disposition: `attachment; filename="${filename}"`,
    });
  }
}

