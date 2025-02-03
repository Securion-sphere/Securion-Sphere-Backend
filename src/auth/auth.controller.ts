import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from "@nestjs/common";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";
import { AuthService } from "./auth.service";
import { RefreshAuthGuard } from "./guards/refresh-auth/refresh-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth/jwt-auth.guard";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ViewAuthFilter } from "./filters/google-callback.filter";

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
    // console.log(req);
    const response = await this.authService.login(req.user.id);

    // Redirect to the frontend with tokens in the query params
    const frontendUrl = this.configService.get<string>("app.frontendUrl");
    res.redirect(
      `${frontendUrl}/?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`,
    );
  }

  @Get("bypass-google-login-na-krub/:id")
  async bypassLoginNakrub(@Param("id") id: number) {
    if (this.configService.get<string>("app.nodeEnv") !== "production") {
      return this.authService.login(id);
    }
  }

  @UseGuards(RefreshAuthGuard)
  @ApiBearerAuth("refresh-token")
  @Post("refresh")
  refreshToken(@Req() req: { user: { id: number } }) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @Post("logout")
  logout(@Req() req: { user: { id: number } }) {
    return this.authService.logout(req.user.id);
  }
}
