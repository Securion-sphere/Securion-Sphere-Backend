import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Student, Supervisor])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
