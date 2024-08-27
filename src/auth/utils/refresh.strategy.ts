import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { Inject, Injectable } from '@nestjs/common';
import refreshJwtCofig from 'src/config/refresh-jwt.cofig';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtCofig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtCofig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: refreshJwtConfiguration.secret,
    });
  }

  validate(payload: AuthJwtPayload) {
    return { id: payload.sub };
  }
}
