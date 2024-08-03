import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get<ConfigService>(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('SecurionSphere API')
      .setDescription('SecurionSphere API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('SecurionSphere API')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('document', app, document);
  }

  const port = configService.get<number>('app.port');
  await app.listen(port, '0.0.0.0');
}
bootstrap();
