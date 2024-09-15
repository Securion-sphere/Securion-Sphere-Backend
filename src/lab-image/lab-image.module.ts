import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabImageController } from "./lab-image.controller";
import { LabImageService } from "./lab-image.service";
import { LabImage } from "src/entities/lab-image.entity";

@Module({
  imports: [TypeOrmModule.forFeature([LabImage])],
  controllers: [LabImageController],
  providers: [LabImageService],
})
export class LabImageModule {}
