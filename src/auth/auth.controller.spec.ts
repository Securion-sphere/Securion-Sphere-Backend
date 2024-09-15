import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { GoogleAuthGuard } from "./guards/google-auth/google-auth.guard";

describe("AuthController", () => {
  let authController: AuthController;
  let authService: AuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            refreshToken: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe("googleLogin", () => {
    it("should use GoogleAuthGuard", () => {
      const guard = Reflect.getMetadata(
        "__guards__",
        AuthController.prototype.googleLogin,
      )[0];
      expect(guard).toBe(GoogleAuthGuard);
    });
  });

  describe("googleCallback", () => {
    it("should login user and redirect to frontend", async () => {
      const req = { body: { user: { id: "userId" } } };
      const res = { redirect: jest.fn() };

      const response = {
        id: 0,
        accessToken: "accessToken",
        refreshToken: "refreshToken",
      };
      const frontendUrl = configService.get<string>("frontendUrl");

      jest.spyOn(authService, "login").mockResolvedValue(response);
      jest.spyOn(configService, "get").mockReturnValue(frontendUrl);

      await authController.googleCallback(req, res);

      expect(authService.login).toHaveBeenCalledWith("userId");
      expect(res.redirect).toHaveBeenCalledWith(
        `${frontendUrl}/?accessToken=accessToken&refreshToken=refreshToken`,
      );
    });
  });

  describe("refreshToken", () => {
    it("should refresh the user token", async () => {
      const req = { user: { id: "userId" } };
      const refreshTokenResponse = { accessToken: "newAccessToken" };
      authService.refreshToken = jest
        .fn()
        .mockResolvedValue(refreshTokenResponse);
      const result = await authController.refreshToken(req);
      expect(authService.refreshToken).toHaveBeenCalledWith("userId");
      expect(result).toEqual(refreshTokenResponse);
    });
  });

  describe("logout", () => {
    it("should logout the user", () => {
      const req = { user: { id: "userId" } };

      authController.logout(req);

      expect(authService.logout).toHaveBeenCalledWith("userId");
    });
  });
});
