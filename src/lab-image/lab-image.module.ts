import { Module } from "@nestjs/common";
import { LabImageService } from "./lab-image.service";

@Module({
  providers: [LabImageService],
})
export class LabImageModule {}
