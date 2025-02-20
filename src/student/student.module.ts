import { Module } from "@nestjs/common";
import { StudentService } from "./student.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Student } from "src/entities/student.entity";
import { StudentController } from "./student.controller";
import { Supervisor } from "src/entities/supervisor.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Student, Supervisor])],
  controllers: [StudentController],
  providers: [StudentService],
})
export class StudentModule {}
