import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Supervisor } from "../../entities/supervisor.entity";

@Injectable()
export class SupervisorGuard implements CanActivate {
  constructor(
    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // Retrieve userId from decoded JWT

    if (!userId) {
      throw new UnauthorizedException("User ID is missing from the token");
    }

    const supervisor = await this.supervisorRepository.findOne({
      where: { user: { id: userId } }, // Query the related User entity
      relations: ["user"], // Ensure the `user` relation is loaded
    });

    if (!supervisor) {
      throw new ForbiddenException("Access denied. User is not a supervisor.");
    }

    return true; // Allow access if the user is a supervisor
  }
}
