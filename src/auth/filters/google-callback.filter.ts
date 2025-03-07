import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Catch(UnauthorizedException)
export class ViewAuthFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const frontendUrl = this.configService.get<string>("app.frontendUrl");
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response
      .status(status)
      .redirect(
        `${frontendUrl}/auth/login?error=${encodeURIComponent(exception.message)}`,
      );
  }
}
