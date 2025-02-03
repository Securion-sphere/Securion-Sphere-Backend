import { registerAs } from "@nestjs/config";
import { DataSource } from "typeorm";
import { config } from "dotenv";

export default registerAs("typeorm", () => ({
  type: "postgres",
  host: process.env.DB_HOST, // or use configService.get('DB_HOST') if injecting ConfigService
  port: +process.env.DB_PORT, // same for port, username, password, etc.
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/migrations/*{.ts,.js}"],
  synchronize: true,
}));

config({ path: [".env.local", ".env"] });

export const dataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST, // or use configService.get('DB_HOST') if injecting ConfigService
  port: +process.env.DB_PORT, // same for port, username, password, etc.
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["dist/migrations/*{.ts,.js}"],
  synchronize: false,
});
