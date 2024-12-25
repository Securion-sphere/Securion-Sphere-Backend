// learning-material.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { LearningMaterialService } from './learning-material.service';
import { LearningMaterialController } from './learning-material.controller';
import minioConfig from 'src/config/minio.config';

@Module({
  imports: [
    ConfigModule.forFeature(minioConfig),
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
