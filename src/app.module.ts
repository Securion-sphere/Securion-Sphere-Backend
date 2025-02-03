import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { LabModule } from "./lab/lab.module";
import { LabImageModule } from "./lab-image/lab-image.module";
import { ActivedLabModule } from "./actived-lab/actived-lab.module";
import { LearningMaterialModule } from "./learning-material/learning-material.module";
import { StudentModule } from "./student/student.module";
import { HealthModule } from "./health/health.module";
import { TerminusModule } from "@nestjs/terminus";
import * as config from "./config";
import * as Joi from "joi";

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({
      load: [...Object.values(config)],
      envFilePath: [".env.local", ".env"],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid("development", "production", "test", "provision")
          .default("development"),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          ...configService.get("typeorm"),
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),
    AuthModule,
    UserModule,
    LabModule,
    LabImageModule,
    ActivedLabModule,
    LearningMaterialModule,
    StudentModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
