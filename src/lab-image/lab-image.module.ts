import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabImageController } from "./lab-image.controller";
import { LabImageService } from "./lab-image.service";
import { LabImage } from "src/entities/lab-image.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { User } from "src/entities/user.entity";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import dockerConfig from "src/config/docker-api.config";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([LabImage, Supervisor, User]),
    ConfigModule.forFeature(dockerConfig),
  ],
  controllers: [LabImageController],
  providers: [LabImageService],
})
export class LabImageModule {}
