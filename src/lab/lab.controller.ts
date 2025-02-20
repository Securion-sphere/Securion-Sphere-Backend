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
  create(
    @Req() req: { user: { id: number } },
    @Body() createLabDto: CreateLabDto,
  ) {
    return this.labService.create({ userId: req.user.id, ...createLabDto });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  findAll() {
    return this.labService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  findOne(@Param("id") id: number) {
    return this.labService.findOne(id);
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
