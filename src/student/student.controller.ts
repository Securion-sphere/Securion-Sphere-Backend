import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { StudentService } from "./student.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth/jwt-auth.guard";
import { SupervisorGuard } from "src/user/guards/role.guard";
import { AssignStudentDto } from "./dto/assign-student.dto";

@Controller("student")
@ApiTags("student")
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  findAll() {
    return this.studentService.findAll();
  }

  @Get(":userId")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  findOne(@Param("userId") userId: number) {
    return this.studentService.findOne(userId);
  }

  @Post("assign/:userId")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  assignStudent(
    @Body() assignStudentDto: AssignStudentDto,
    @Param("userId") userId: number,
  ) {
    return this.studentService.assignStudent(assignStudentDto, userId);
  }

  @Delete("unassign/:userId")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtAuthGuard, SupervisorGuard)
  unassignStudent(@Param("userId") userId: number) {
    return this.studentService.unassignStudent(userId);
  }
}
