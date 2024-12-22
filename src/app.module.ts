import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config from "./config/config";
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
import typeorm from "./config/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        typeorm,
        config,
        dockerConfig,
        googleOauthConfig,
        jwtConfig,
        refreshJwtConfig,
      ],
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        console.log(configService.get("typeorm"));
        return configService.get("typeorm");
      },
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
