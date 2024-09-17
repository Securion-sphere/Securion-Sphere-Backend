import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config from "./config/config";
import dbConfig from "./config/db.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { LabModule } from "./lab/lab.module";
import { LabImageModule } from "./lab-image/lab-image.module";
import { ActivedLabModule } from "./actived-lab/actived-lab.module";
import dockerConfig from "./config/docker.config";
import googleOauthConfig from "./config/google-oauth.config";
import jwtConfig from "./config/jwt.config";
import refreshJwtConfig from "./config/refresh-jwt.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        config,
        dbConfig,
        dockerConfig,
        googleOauthConfig,
        jwtConfig,
        refreshJwtConfig,
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("db.host", "localhost"),
        port: configService.get<number>("db.port", 5432),
        username: configService.get<string>("db.user"),
        password: configService.get<string>("db.pass"),
        database: configService.get<string>("db.name"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
      }),
    }),
    AuthModule,
    UserModule,
    LabModule,
    LabImageModule,
    ActivedLabModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
