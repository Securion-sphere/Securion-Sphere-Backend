import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserService } from "src/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as argon2 from "argon2";
import refreshJwtConfig from "src/config/refresh-jwt.config";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

jest.mock("argon2");

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            updateHashedRefreshToken: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe("login", () => {
    it("should return tokens if user exists", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue({ id: 1 });
      jest.spyOn(argon2, "hash").mockResolvedValue("hashed_refresh_token");

      const result = await authService.login(1);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(userService.updateHashedRefreshToken).toHaveBeenCalledWith(
        1,
        "hashed_refresh_token",
      );
    });

    it("should return user not found if user does not exist", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);
      const result = await authService.login(1);
      expect(result).toEqual({ msg: "User not found" });
    });
  });

  describe("validateRefreshToken", () => {
    it("should pass if token is valid", async () => {
      // Mock the user repository to return a hashed refresh token
      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        hashedRefreshToken: "hashed_refresh_token", // Assuming refreshToken is stored in the user object
      });

      // Mock argon2.verify (or whatever method you use for token verification)
      jest.spyOn(argon2, "verify").mockResolvedValue(true); // Simulate that token matches

      // Call the validateRefreshToken method
      const result = await authService.validateRefreshToken(1, "refresh_token");

      // Check that the method was called and the result is truthy
      expect(result).toBeTruthy();
    });

    it("should throw error if user or token is invalid", async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Mock the validateRefreshToken method to track how many times it is called
      const validateMock = jest.spyOn(authService, "validateRefreshToken");

      // Expect an error to be thrown
      await expect(
        authService.validateRefreshToken(1, "token"),
      ).rejects.toThrow(UnauthorizedException);

      // Check that the method was called exactly once
      expect(validateMock).toHaveBeenCalledTimes(1);
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

  describe("validateGoogleUser", () => {
    it("should return existing user if found", async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@example.com",
      });
      const result = await authService.validateGoogleUser({
        firstName: "test",
        lastName: "test",
        nickName: null,
        profile_img: null,
        email: "test@example.com",
      });
      expect(result).toEqual({ id: 1, email: "test@example.com" });
    });

    it("should create a new user if not found", async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      (userService.create as jest.Mock).mockResolvedValue({
        id: 2,
        email: "new@example.com",
      });
      const result = await authService.validateGoogleUser({
        firstName: "new",
        lastName: "new",
        nickName: null,
        profile_img: null,
        email: "new@example.com",
      });
      expect(result).toEqual({ id: 2, email: "new@example.com" });
    });
  });
});
