import { Module } from "@nestjs/common";
import { ConfigModule, ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { S3Client } from "@aws-sdk/client-s3";
import { LearningMaterialService } from "./learning-material.service";
import { LearningMaterialController } from "./learning-material.controller";
import { LearningMaterial } from "src/entities/learning-material.entity";
import minioConfig from "src/config/minio.config";
import { User } from "src/entities/user.entity";
import { Supervisor } from "src/entities/supervisor.entity";

@Module({
  imports: [
    ConfigModule.forFeature(minioConfig),
    TypeOrmModule.forFeature([LearningMaterial, User, Supervisor]),
  ],
  controllers: [LearningMaterialController],
  providers: [
    LearningMaterialService,
    {
      provide: S3Client,
      useFactory: (config: ConfigType<typeof minioConfig>) => {
        return new S3Client({
          endpoint: config.endpoint,
          forcePathStyle: true,
          region: config.region,
          credentials: {
            accessKeyId: config.accessKey,
            secretAccessKey: config.secretKey,
          },
        });
      },
      inject: [minioConfig.KEY],
    },
  ],
})
export class LearningMaterialModule {}
