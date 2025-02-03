import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { ConfigModule } from "@nestjs/config";
import googleOauthConfig from "src/config/google-oauth.config";
import { GoogleStrategy } from "./utils/google.strategy";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { JwtModule } from "@nestjs/jwt";
import { jwtConfig, refreshJwtConfig } from "src/config";
import { JwtStrategy } from "./utils/jwt.strategy";
import { RefreshJwtStrategy } from "./utils/refresh.strategy";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";

@Module({
  imports: [
    ConfigModule.forFeature(googleOauthConfig),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    TypeOrmModule.forFeature([User, Student, Supervisor]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    AuthService,
    UserService,
    JwtStrategy,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
