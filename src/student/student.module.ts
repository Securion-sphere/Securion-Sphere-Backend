import { Module } from "@nestjs/common";
import { StudentService } from "./student.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "src/entities/student.entity";
import { User } from "src/entities/user.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { StudentController } from "./student.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Student, User, Supervisor])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
