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
import { AddEmailsDto } from "./dto/add-email.dto";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("email-add")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  async addEmails(@Body() addEmailsDto: AddEmailsDto) {
    return this.userService.addEmails(addEmailsDto);
  }

  @Get()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @Get("profile")
  getProfile(@Req() req: { user: { id: number } }) {
    return this.userService.findOne(req.user.id);
  }

  @Get("count")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  async countUsers() {
    const count = await this.userService.countUsers();
    return { count };
  }

  @Get("profile/:id")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  updateProfile(
    @Req() req: { user: { id: number } },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, updateUserDto);
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
