import { Module } from "@nestjs/common";
import { Lab } from "src/entities/lab.entity";
import { User } from "src/entities/user.entity";
import { ActivedLabController } from "./actived-lab.controller";
import { ActivedLabService } from "./actived-lab.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivatedLab } from "src/entities/actived-lab.entity";
import { ConfigModule } from "@nestjs/config";
import dockerConfig from "src/config/docker-api.config";
import { UserService } from "src/user/user.service";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { Solvation } from "src/entities/solvation.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivatedLab,
      Lab,
      User,
      Student,
      Supervisor,
      Solvation,
    ]),
    ConfigModule.forFeature(dockerConfig),
  ],
  controllers: [ActivedLabController],
  providers: [ActivedLabService, UserService],
})
export class ActivedLabModule {}
