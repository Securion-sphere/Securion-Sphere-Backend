import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ActivedLabService } from "./actived-lab.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { CreateLabInstanceDto } from "./dto/active-lab.dto";
import { DeleteLabInstanceDto } from "./dto/deactivated-lab.dto";
import { SubmitFlagDto } from "./dto/submit-flag.dto";
import { GetLabInstanceResponseDto } from "./dto/get-instance.dto";

@Controller("actived-lab")
export class ActivedLabController {
  constructor(private readonly activedLabService: ActivedLabService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async active(@Body() createLabInstanceDto: CreateLabInstanceDto) {
    return await this.activedLabService.active(createLabInstanceDto);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async deactivate(@Body() deleteLabInstanceDto: DeleteLabInstanceDto) {
    return this.activedLabService.deactivate(deleteLabInstanceDto);
  }

  @Post("submit-flag")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async submitFlag(@Body() submitFlagDto: SubmitFlagDto) {
    return this.activedLabService.submitFlag(submitFlagDto);
  }

  @Get("get-instance")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async getInstance(@Req() req): Promise<GetLabInstanceResponseDto> {
    return this.activedLabService.getInstance(req.user.id);
  }
}
