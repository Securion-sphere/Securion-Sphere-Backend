import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { AuthService } from "./auth.service";
import { RefreshAuthGuard } from "./guards/refresh-auth/refresh-auth.guard";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ViewAuthFilter } from "./filters/google-callback.filter";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(GoogleAuthGuard)
  @Get("google/login")
  async googleLogin() {}

  @UseGuards(GoogleAuthGuard)
  @UseFilters(ViewAuthFilter)
  @Get("google/callback")
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.login(req.user.id);
    const frontendUrl = this.configService.get<string>("app.frontendUrl");
    res.redirect(
      `${frontendUrl}/?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
    );
  }

  @UseGuards(RefreshAuthGuard)
  @ApiBearerAuth("refresh-token")
  @Post("refresh")
  refreshToken(@Req() req: { user: { id: number } }) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout(@Req() req: { user: { id: number } }) {
    return this.authService.logout(req.user.id);
  }
}
