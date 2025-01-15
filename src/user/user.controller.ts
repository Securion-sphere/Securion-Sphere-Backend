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
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SupervisorGuard } from "./guards/role.guard";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @Get("profile")
  getProfile(@Req() req) {
    return this.userService.findOne(req.user.id);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+req.user.id, updateUserDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiBearerAuth("access-token")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
