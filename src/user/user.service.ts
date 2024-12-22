import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { Injectable } from "@nestjs/common";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { Role } from "./types/role";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepo: Repository<Supervisor>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);
    const resUser = await this.userRepo.save(user);

    const studenRegex = /^\d{8}@kmitl\.ac\.th$/;
    const supervisorRegex = /^[a-zA-Z]+(\.[a-zA-Z]+)?@kmitl\.ac\.th$/;

    let role: Role = null;

    if (studenRegex.test(resUser.email)) {
      const { user } = await this.studentRepo.save(
        this.studentRepo.create({
          user: resUser,
          year: 0,
          solved_lab: [],
        }),
      );
      role = { role: "Student", user };
    } else if (supervisorRegex.test(resUser.email)) {
      const { user } = await this.supervisorRepo.save(
        this.supervisorRepo.create({
          user: resUser,
        }),
      );
      role = { role: "Supervisor", user };
    }
    return role;
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: {
        email,
      },
    });
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ["student", "supervisor", "student.solved_lab"],
    });

    return user;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return this.userRepo.update({ id: userId }, { hashedRefreshToken });
  }
}
