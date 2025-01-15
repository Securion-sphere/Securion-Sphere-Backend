import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { LabImageService } from "./lab-image.service";
import { CreateLabImageDto } from "./dto/create-lab-image.dto";
import { UpdateLabImageDto } from "./dto/update-lab-image.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupervisorGuard } from "src/user/guards/role.guard";

@Controller("lab-image")
@ApiTags("lab-image")
export class LabImageController {
  constructor(private readonly labImageService: LabImageService) {}

  @Post()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  create(@Body() createLabDto: CreateLabImageDto) {
    return this.labImageService.create(createLabDto);
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
  update(
    @Param("name") name: string,
    @Body() updateLabImageDto: UpdateLabImageDto,
  ) {
    return this.labImageService.update(name, updateLabImageDto);
  }

  @Delete(":name")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  remove(@Param("name") name: string) {
    return this.labImageService.remove(name);
  }
}
