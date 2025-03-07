import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const nodeEnv = configService.get<string>("app.nodeEnv");

  const allowedOrigins =
    nodeEnv !== "development"
      ? [`${configService.get<string>("app.frontendUrl")}`, "localhost:3000"]
      : [`${configService.get<string>("app.frontendUrl")}`];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (nodeEnv === "development") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("SecurionSphere API")
      .setDescription("SecurionSphere API")
      .setVersion("1.2")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
          name: "Access Token",
          description: "Enter your Bearer access token",
        },
        "access-token",
      )
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
          name: "Refresh Token",
          description: "Enter your Bearer refresh token",
        },
        "refresh-token",
      )
      .addTag("SecurionSphere API")
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("document", app, document);
  }

  const port = configService.get<number>("app.port");
  await app.listen(port);
}

void bootstrap();
