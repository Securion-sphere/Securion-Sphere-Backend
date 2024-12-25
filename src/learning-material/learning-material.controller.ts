import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LearningMaterialService } from './learning-material.service';
import { CreateLearningMaterialDto } from './dto/create-learning-material.dto';
import { UpdateLearningMaterialDto } from './dto/update-learning-material.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

@Controller('learning-material')
@ApiTags("learning-material")
export class LearningMaterialController {
  constructor(
    private readonly learningMaterialService: LearningMaterialService,
  ) {}

  @Post('upload')
  @ApiConsumes('multipart/Form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.learningMaterialService.uploadFile(file);
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
     return this.learningMaterialService.getFileUrl(key);
   }
}
