import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { LabService } from "./lab.service";
import { CreateLabDto } from "./dto/create-lab.dto";
import { UpdateLabDto } from "./dto/update-lab.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupervisorGuard } from "src/user/guards/role.guard";

@Controller("lab")
@ApiTags("lab")
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  create(@Body() createLabDto: CreateLabDto) {
    return this.labService.create(createLabDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  findAll(@Req() req: { user: { id: number } }) {
    return this.labService.findAll(req.user.id);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  findOne(@Req() req: { user: { id: number } }, @Param("id") id: number) {
    return this.labService.findOne(req.user.id, id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  update(@Param("id") id: number, @Body() updateLabDto: UpdateLabDto) {
    return this.labService.updateById(id, updateLabDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  remove(@Param("id") id: number) {
    return this.labService.removeById(id);
  }
}
