import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import refreshJwtConfig from "src/config/refresh-jwt.config";

jest.mock("argon2");

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            updateHashedRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue("mocked_token"),
          },
        },
        {
          provide: refreshJwtConfig.KEY,
          useValue: {},
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe("login", () => {
    it("should return tokens if user exists", async () => {
      userService.findOne = jest.fn().mockResolvedValue({ id: 1 });
      jest.spyOn(argon2, "hash").mockResolvedValue("hashed_refresh_token");

      const result = await authService.login(1);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should return user not found if user does not exist", async () => {
      userService.findOne = jest.fn().mockResolvedValue(null);

      const result = await authService.login(1);

      expect(result).toEqual({ msg: "User not found" });
    });
  });

  describe("validateRefreshToken", () => {
    it("should throw error if user or token is invalid", async () => {
      userService.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        authService.validateRefreshToken(1, "token"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refreshToken", () => {
    it("should return new tokens", async () => {
      jest.spyOn(argon2, "hash").mockResolvedValue("new_hashed_refresh_token");

      const result = await authService.refreshToken(1);
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
    });
  });

  describe("logout", () => {
    it("should clear the hashed refresh token", async () => {
      await authService.logout(1);
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        1,
        null,
      );
    });
  });
});
