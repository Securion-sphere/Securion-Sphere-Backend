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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CreateLabInstanceDto } from "./dto/active-lab.dto";
import { SubmitFlagDto } from "./dto/submit-flag.dto";
import { GetLabInstanceResponseDto } from "./dto/get-instance.dto";

@Controller("actived-lab")
@ApiTags("active-lab")
export class ActivedLabController {
  constructor(private readonly activedLabService: ActivedLabService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async active(
    @Req() req: { user: { id: number } },
    @Body() createLabInstanceDto: CreateLabInstanceDto,
  ) {
    return this.activedLabService.active({
      userId: req.user.id,
      ...createLabInstanceDto,
    });
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async deactivate(@Req() req: { user: { id: number } }) {
    return this.activedLabService.deactivate(req.user.id);
  }

  @Post("submit-flag")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async submitFlag(
    @Req() req: { user: { id: number } },
    @Body() submitFlagDto: SubmitFlagDto,
  ) {
    return this.activedLabService.submitFlag({
      userId: req.user.id,
      ...submitFlagDto,
    });
  }

  @Get("get-instance")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  async getInstance(
    @Req() req: { user: { id: number } },
  ): Promise<GetLabInstanceResponseDto> {
    return this.activedLabService.getInstance(req.user.id);
  }
}
