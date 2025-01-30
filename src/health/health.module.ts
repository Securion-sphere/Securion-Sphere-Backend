import { Module } from "@nestjs/common";
import { HealthService } from "./health.service";
import { HealthController } from "./health.controller";
import { TerminusModule } from "@nestjs/terminus";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [TerminusModule, ConfigModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
