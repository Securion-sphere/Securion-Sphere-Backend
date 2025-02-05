import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { PreLoginUser } from "src/entities/pre-login-user.entity";
import { MulterModule } from "@nestjs/platform-express";

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB limit
      },
    }),
    TypeOrmModule.forFeature([User, Student, Supervisor, PreLoginUser]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
