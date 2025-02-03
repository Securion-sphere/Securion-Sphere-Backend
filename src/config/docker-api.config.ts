import { registerAs } from "@nestjs/config";

export default registerAs("dockerApi", () => ({
  host: process.env.DOCKER_API_HOST,
  url: process.env.DOCKER_API_URL,
}));
