import { Module } from "@nestjs/common";
import { Lab } from "src/entities/lab.entity";
import { User } from "src/entities/user.entity";
import { ActivedLabController } from "./actived-lab.controller";
import { ActivedLabService } from "./actived-lab.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivatedLab } from "src/entities/actived-lab.entity";
import { ConfigModule } from "@nestjs/config";
import dockerConfig from "src/config/docker.config";
import { UserService } from "src/user/user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ActivatedLab, Lab, User]),
    ConfigModule.forFeature(dockerConfig),
  ],
  controllers: [ActivedLabController],
  providers: [ActivedLabService, UserService],
})
export class ActivedLabModule {}
