import { registerAs } from "@nestjs/config";

export default registerAs("dockerApi", () => ({
  docker: {
    host: process.env.DOCKER_API_HOST,
    api: process.env.DOCKER_API_URL,
  },
}));
