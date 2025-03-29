import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  TypeOrmHealthIndicator,
} from "@nestjs/terminus";
import { ApiTags } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

@Controller("health")
@ApiTags("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly http: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => this.db.pingCheck("database"),
      async () =>
        this.http.pingCheck(
          "docker-api-service",
          `${this.configService.get<string>("dockerApi.url")}/health`,
        ),

      async () =>
        this.http.pingCheck(
          "openvpn-api-service",
          `${this.configService.get<string>("ovpnApi.url")}`,
        ),
      async () =>
        this.http.pingCheck(
          "minio",
          `${this.configService.get<string>("minio.endpoint")}/minio/health/live`,
        ),
    ]);
  }
}
