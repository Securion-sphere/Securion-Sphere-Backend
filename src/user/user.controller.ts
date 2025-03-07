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
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { SupervisorGuard } from "./guards/role.guard";
import { AddEmailsDto } from "./dto/add-email.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { BulkUploadDto } from "./dto/bulk-upload.dto";
import { Request } from "express";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post("email-add")
  @ApiBearerAuth("access-token")
  @ApiTags("user/pre-login")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  async addEmails(@Body() addEmailsDto: AddEmailsDto) {
    return this.userService.addEmails(addEmailsDto);
  }

  @Post("bulk-add-csv")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  @ApiTags("user/pre-login")
  async bulkAddUsersFromCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() bulkUploadDto: BulkUploadDto,
  ) {
    return this.userService.bulkAddUsersFromCsv(file, bulkUploadDto.role);
  }

  @Get("pre-login")
  @ApiTags("user/pre-login")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  findAllPreLoginUser() {
    return this.userService.findAllPreLoginUser();
  }

  // @Delete("openvpn")
  // @ApiBearerAuth("access-token")
  // @UseGuards(JwtAuthGuard)
  // revokeCert(@Req() req: Request & { user: { id: number } }) {
  //   return this.userService.revokeCert(req.user.id, req.headers.authorization);
  // }

  @Delete("pre-login/:email")
  @ApiTags("user/pre-login")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  RemovePreLoginUser(@Param("email") email: string) {
    return this.userService.removePreLoginUser(email);
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
  @UseGuards(JwtAuthGuard, SupervisorGuard)
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

  @Get("openvpn")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  getOpenVPNFile(@Req() req: Request & { user: { id: number } }) {
    return this.userService.getOpenVPNFile(
      req.user.id,
      req.headers.authorization,
    );
  }

  // @Post("openvpn")
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth("access-token")
  // generateCert(@Req() req: Request & { user: { id: number } }) {
  //   return this.userService.generateCert(
  //     req.user.id,
  //     req.headers.authorization,
  //   );
  // }
}
