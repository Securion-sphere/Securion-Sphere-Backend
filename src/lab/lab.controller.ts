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
import { LabService } from "./lab.service";
import { CreateLabDto } from "./dto/create-lab.dto";
import { UpdateLabDto } from "./dto/update-lab.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("lab")
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  create(@Body() createLabDto: CreateLabDto) {
    return this.labService.create(createLabDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  findAll() {
    return this.labService.findAll();
  }

  @Patch(":name")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  update(@Param("name") name: string, @Body() updateLabDto: UpdateLabDto) {
    return this.labService.update(name, updateLabDto);
  }

  @Delete(":name")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  remove(@Param("name") name: string) {
    return this.labService.remove(name);
  }
}
