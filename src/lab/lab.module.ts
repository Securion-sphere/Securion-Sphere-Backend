import { Module } from "@nestjs/common";
import { LabService } from "./lab.service";
import { LabController } from "./lab.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Lab } from "src/entities/lab.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { LabImage } from "src/entities/lab-image.entity";
import { User } from "src/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Lab, User, LabImage, Supervisor])],
  controllers: [LabController],
  providers: [LabService],
})
export class LabModule {}
