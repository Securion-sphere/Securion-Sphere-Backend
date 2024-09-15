import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const nodeEnv = configService.get<string>("NODE_ENV");

  app.enableCors({
    origin: `${configService.get<string>("frontendUrl")}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  if (nodeEnv !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("SecurionSphere API")
      .setDescription("SecurionSphere API")
      .setVersion("1.0")
      .addBearerAuth()
      .addTag("SecurionSphere API")
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup("document", app, document);
  }

  const port = configService.get<number>("app.port");
  await app.listen(port);
}
bootstrap();
