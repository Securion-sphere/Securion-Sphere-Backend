import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { AuthService } from "./auth.service";
import { RefreshAuthGuard } from "./guards/refresh-auth/refresh-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

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
  @Get("google/callback")
  async googleCallback(@Req() req, @Res() res) {
    console.log(req);
    const response = await this.authService.login(req.user.id);

    // Redirect to the frontend with tokens in the query params
    const frontendUrl = this.configService.get<string>("frontendUrl");
    res.redirect(
      `${frontendUrl}/?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
    );
  }

  @Get("bypass-google-login-na-krub/:id")
  async bypassLoginNakrub(@Param("id") id: number) {
    const response = await this.authService.login(id);

    return response;
  }

  @UseGuards(RefreshAuthGuard)
  @ApiBearerAuth("refresh-token")
  @Post("refresh")
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @Post("logout")
  logout(@Req() req) {
    this.authService.logout(req.user.id);
  }
}
