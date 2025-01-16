import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  healthcheck(): { msg: string } {
    return { msg: "healthy" };
  }
}
