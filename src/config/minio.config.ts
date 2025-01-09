import { registerAs } from "@nestjs/config";

export default registerAs("minio", () => ({
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  endpoint: process.env.MINIO_ENDPOINT,
  region: process.env.MINIO_REGION,
  bucket: process.env.MINIO_BUCKET,
}));
