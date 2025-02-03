import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigService } from "@nestjs/config";
import { getMockRes } from "@jest-mock/express";

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
            login: jest.fn().mockResolvedValue({
              accessToken: "testAccessToken",
              refreshToken: "testRefreshToken",
            }),
            refreshToken: jest.fn().mockResolvedValue({
              refreshToken: "newRefreshToken",
              accessToken: "newAccessToken",
            }),
            logout: jest.fn().mockResolvedValue({ message: "Logged out" }),
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

  it("should be defined", () => {
    expect(authController).toBeDefined();
  });

  it("should login with Google and redirect", async () => {
    const req = { user: { id: 1 } };
    const { res, mockClear } = getMockRes();
    mockClear();

    await authController.googleCallback(req, res);

    expect(authService.login).toHaveBeenCalledWith(1);
    expect(res.redirect).toHaveBeenCalledWith(
      `${configService.get<string>("app.frontendUrl")}/?accessToken=testAccessToken&refreshToken=testRefreshToken`,
    );
  });

  it("should call login when nodeEnv is not production", async () => {
    (configService.get as jest.Mock).mockReturnValue("development"); // Mocking non-production environment

    const loginSpy = jest.spyOn(authService, "login");
    await authController.bypassLoginNakrub(1);

    expect(loginSpy).toHaveBeenCalledWith(1); // Ensure login is called
  });

  it("should not call login when nodeEnv is production", async () => {
    (configService.get as jest.Mock).mockReturnValue("production"); // Mocking production environment

    const loginSpy = jest.spyOn(authService, "login");
    await authController.bypassLoginNakrub(1);

    expect(loginSpy).not.toHaveBeenCalled(); // Ensure login is NOT called
  });

  it("should refresh token", async () => {
    const req = { user: { id: 1 } };
    const result = await authController.refreshToken(req);

    expect(authService.refreshToken).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      refreshToken: "newRefreshToken",
      accessToken: "newAccessToken",
    });
  });

  it("should logout user", async () => {
    const req = { user: { id: 1 } };
    const result = await authController.logout(req);

    expect(authService.logout).toHaveBeenCalledWith(1);
    expect(result).toEqual({ message: "Logged out" });
  });
});
