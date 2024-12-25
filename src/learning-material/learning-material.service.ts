// learning-material.service.ts
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigType } from '@nestjs/config';
import minioConfig from 'src/config/minio.config';

@Injectable()
export class LearningMaterialService {
  constructor(
    @Inject(minioConfig.KEY)
    private MinioConfig: ConfigType<typeof minioConfig>,
    private readonly client: S3Client,
  ) {}

  async uploadFile(file) {
    const { originalname } = file;
    if (!(file.mimetype.includes("pdf") || file.mimetype.includes("md"))) {
      throw new HttpException(
        "File type not supported",
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const result = await this.client.send(
        new PutObjectCommand({
          Bucket: this.MinioConfig.bucket,
          Key: originalname,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  async getFileUrl(key: string) {
    return { url: `https://${this.MinioConfig.bucket}.s3.amazonaws.com/${key}` };
  }
}
