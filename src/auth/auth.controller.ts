import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { AuthService } from "./auth.service";
import { RefreshAuthGuard } from "./guards/refresh-auth/refresh-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/login")
  googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/callback")
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.body.user.id);

    // Redirect to the frontend with tokens in the query params
    const frontendUrl = this.configService.get<string>("frontendUrl");
    res.redirect(
      `${frontendUrl}/?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
    );
  }

  @UseGuards(RefreshAuthGuard)
  @Post("refresh")
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout(@Req() req) {
    this.authService.logout(req.user.id);
  }
}
