import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
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
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () =>
        this.http
          .pingCheck(
            "docker-api-microservice",
            this.config.get<string>("docker.api"),
          )
          .catch(() => {
            throw new ServiceUnavailableException(
              "Docker API Microservice is not unavailable",
            );
          }),
    ]);
  }
}
