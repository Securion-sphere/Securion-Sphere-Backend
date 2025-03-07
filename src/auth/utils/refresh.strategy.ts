import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthJwtPayload } from "../types/auth-jwtPayload";
import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import refreshJwtCofig from "src/config/refresh-jwt.config";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  "refresh-jwt",
) {
  constructor(
    @Inject(refreshJwtCofig.KEY)
    refreshJwtConfiguration: ConfigType<typeof refreshJwtCofig>,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshJwtConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const authHeader = req.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Refresh Token Missing");
    }
    const refreshToken = authHeader.replace("Bearer ", "").trim();
    return this.authService.validateRefreshToken(payload.sub, refreshToken);
  }
}
