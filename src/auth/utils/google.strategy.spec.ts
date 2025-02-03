import { Test, TestingModule } from "@nestjs/testing";
import { GoogleStrategy } from "./google.strategy";
import { AuthService } from "../auth.service";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import googleOauthConfig from "src/config/google-oauth.config";
import { VerifyCallback } from "passport-google-oauth2";

describe("GoogleStrategy", () => {
  let googleStrategy: GoogleStrategy;

  // Mock the AuthService
  const mockAuthService = {
    validateGoogleUser: jest.fn(),
  };

  // Mock googleOauthConfig
  const mockGoogleOauthConfig = {
    clientID: "mock-client-id",
    clientSecret: "mock-client-secret",
    callbackURL: "mock-callback-url",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule, ConfigModule],
      providers: [
        GoogleStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: googleOauthConfig.KEY,
          useValue: mockGoogleOauthConfig,
        },
      ],
    }).compile();

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it("should be defined", () => {
    expect(googleStrategy).toBeDefined();
  });

  describe("validate", () => {
    it("should validate and return the user", async () => {
      const profile = {
        emails: [{ value: "testuser@example.com" }],
        name: { givenName: "Test", familyName: "User" },
        photos: [{ value: "http://photo.url" }],
      };

      const user = {
        email: "testuser@example.com",
        firstName: "Test",
        lastName: "User",
        profile_img: "http://photo.url",
        nickName: null,
      };

      const accessToken = "testAccessToken";
      const refreshToken = "testRefreshToken";

      // Mock the response of the AuthService
      mockAuthService.validateGoogleUser.mockResolvedValue(user);

      const done = jest.fn();

      await googleStrategy.validate(
        accessToken,
        refreshToken,
        profile,
        done as VerifyCallback,
      );

      expect(mockAuthService.validateGoogleUser).toHaveBeenCalledWith({
        email: "testuser@example.com",
        firstName: "Test",
        lastName: "User",
        profile_img: "http://photo.url",
        nickName: null,
      });
      expect(done).toHaveBeenCalledWith(null, user);
    });
  });
});
