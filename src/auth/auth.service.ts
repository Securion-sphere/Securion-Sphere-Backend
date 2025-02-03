import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";
import { AuthJwtPayload } from "./types/auth-jwtPayload";
import refreshJwtConfig from "src/config/refresh-jwt.config";
import { ConfigType } from "@nestjs/config";
import * as argon2 from "argon2";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async login(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { msg: "User not found" };
    }
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    // console.log(
    //   `userId: ${userId}\naccessToken: ${accessToken}\nrefreshToken: ${refreshToken}`,
    // );
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    // console.log(user);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException("Invalid Refresh Token");

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    // console.log("Refresh Token:", refreshTokenMatches);
    if (!refreshTokenMatches)
      throw new UnauthorizedException("Invalid Refresh Token");

    return { id: userId };
  }

  async validateGoogleUser(googleUser: CreateUserDto) {
    const user = await this.userService.findByEmail(googleUser.email);
    if (user) return user;
    return this.userService.create(googleUser);
  }

  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);

    // Update only after successful validation
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);

    return { id: userId, accessToken, refreshToken };
  }

  async logout(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }
}
