import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabImageController } from "./lab-image.controller";
import { LabImageService } from "./lab-image.service";
import { LabImage } from "src/entities/lab-image.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { User } from "src/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LabImage, Supervisor, User])],
  controllers: [LabImageController],
  providers: [LabImageService],
})
export class LabImageModule {}
