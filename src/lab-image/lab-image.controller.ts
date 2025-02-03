import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { LabImageService } from "./lab-image.service";
import { CreateLabImageDto } from "./dto/create-lab-image.dto";
import { UpdateLabImageDto } from "./dto/update-lab-image.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SupervisorGuard } from "src/user/guards/role.guard";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("lab-image")
@ApiTags("lab-image")
export class LabImageController {
  constructor(private readonly labImageService: LabImageService) {}

  @Post()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  create(
    @Body() createLabDto: CreateLabImageDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.labImageService.create(createLabDto, file);
  }

  @Get()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.labImageService.findAll();
  }

  @Patch(":name")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  update(
    @Param("id") id: string,
    @Body() updateLabImageDto: UpdateLabImageDto,
  ) {
    return this.labImageService.update(id, updateLabImageDto);
  }

  @Delete(":name")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  remove(@Param("name") name: string) {
    return this.labImageService.remove(name);
  }
}
