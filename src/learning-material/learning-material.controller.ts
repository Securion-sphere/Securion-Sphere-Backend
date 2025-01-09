import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
  StreamableFile,
  NotFoundException,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { LearningMaterialService } from "./learning-material.service";
import { CreateLearningMaterialDto } from "./dto/create-learning-material.dto";
import { UpdateLearningMaterialDto } from "./dto/update-learning-material.dto";

@Controller("learning-material")
@ApiTags("learning-material")
export class LearningMaterialController {
  constructor(
    private readonly learningMaterialService: LearningMaterialService,
  ) {}

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image", maxCount: 1 },
      { name: "file", maxCount: 1 },
    ]),
  )
  create(
    @Body() createLearningMaterialDto: CreateLearningMaterialDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
  ) {
    return this.learningMaterialService.create(
      createLearningMaterialDto,
      files,
    );
  }

  @Get()
  findAll() {
    return this.learningMaterialService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.learningMaterialService.findOne(+id);
  }

  @Put(":id")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image", maxCount: 1 },
      { name: "file", maxCount: 1 },
    ]),
  )
  update(
    @Param("id") id: string,
    @Body() updateLearningMaterialDto: UpdateLearningMaterialDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
  ) {
    return this.learningMaterialService.update(
      +id,
      updateLearningMaterialDto,
      files,
    );
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.learningMaterialService.remove(+id);
  }

  @Get("download/:id")
  async downloadFile(@Param("id") id: number): Promise<StreamableFile> {
    const fileStream = await this.learningMaterialService.getFile(id);
    if (!fileStream) {
      throw new NotFoundException("File not found");
    }
    // You can set the filename dynamically or based on the entity
    const material = await this.learningMaterialService.findOne(id);
    return new StreamableFile(fileStream, {
      type: material.fileType || "application/octet-stream",
      disposition: `attachment; filename="${material.fileName}"`,
    });
  }
}
