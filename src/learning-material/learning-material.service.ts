import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigType } from '@nestjs/config';
import minioConfig from 'src/config/minio.config';
import { Readable } from 'stream';

@Injectable()
export class LearningMaterialService {
  constructor(
    @Inject(minioConfig.KEY)
    private MinioConfig: ConfigType<typeof minioConfig>,
    private readonly client: S3Client,
  ) {}

  async uploadFile(file: Express.Multer.File) {
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
          Key: file.originalname,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return result;
    } catch (err) {
      console.log(err);
    }
  }

  async getFile(filename: string) {
    try {
      const response: GetObjectCommandOutput = await this.client.send(
        new GetObjectCommand({
          Bucket: this.MinioConfig.bucket,
          Key: filename,
        }),
      );
      return response.Body as Readable ?? null;
    } catch (err) {
      console.error(`Error getting file "${filename}":`, err);
      throw err;
    }
  }
}
