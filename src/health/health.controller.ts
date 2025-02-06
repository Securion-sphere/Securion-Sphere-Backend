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
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const healthChecks = [
      async () => {
        try {
          await this.db.pingCheck("database");
          return { status: "ok", service: "database" };
        } catch (error) {
          return {
            status: "error",
            service: "database",
            message: error.message,
          };
        }
      },
      async () => {
        try {
          await this.http.pingCheck(
            "docker-api-microservice",
            `${this.configService.get<string>("dockerApi.url")}/health`,
          );
          return { status: "ok", service: "docker-api-microservice" };
        } catch (error) {
          return {
            status: "error",
            service: "docker-api-microservice",
            message: error.message,
          };
        }
      },
    ];

    const results = await Promise.all(healthChecks.map((check) => check()));
    const failedServices = results.filter(
      (result) => result.status === "error",
    );

    if (failedServices.length > 0) {
      return {
        status: "error",
        services: results,
      };
    }

    return {
      status: "ok",
      services: results,
    };
  }
}
