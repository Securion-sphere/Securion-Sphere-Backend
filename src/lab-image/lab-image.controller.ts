import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from "@nestjs/common";
import { LabImageService } from "./lab-image.service";
import { CreateLabImageDto } from "./dto/create-lab-image.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SupervisorGuard } from "src/user/guards/role.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";

@Controller("lab-image")
@ApiTags("lab-image")
@ApiBearerAuth("access-token")
export class LabImageController {
  constructor(private readonly labImageService: LabImageService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("image"))
  create(
    @Body() createLabDto: CreateLabImageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.labImageService.create(
      req.headers.authorization,
      createLabDto,
      file,
    );
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  findOne(@Param("id") id: string, @Req() req: Request) {
    return this.labImageService.findOne(req.headers.authorization, id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  findAll() {
    return this.labImageService.findAll();
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  remove(@Req() req: Request, @Param("id") id: string) {
    return this.labImageService.remove(req.headers.authorization, id);
  }
}
