import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  port: parseInt(process.env.APP_PORT) || 5000,
}));
