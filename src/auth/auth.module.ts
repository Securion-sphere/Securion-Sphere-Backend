import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import googleOauthConfig from 'src/config/google-oauth.config';
import { GoogleStrategy } from './utils/GoogleStrategy';

@Module({
  imports: [ConfigModule.forFeature(googleOauthConfig)],
  controllers: [AuthController],
  providers: [GoogleStrategy],
})
export class AuthModule {}
