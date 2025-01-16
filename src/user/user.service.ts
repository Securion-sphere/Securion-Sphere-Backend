import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
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
      relations: [
        "student",
        "supervisor",
        "student.solved_lab",
        "supervisor.labs",
      ],
    });

    if (user) {
      if (!user.student) {
        delete user.student;
      }
      if (!user.supervisor) {
        delete user.supervisor;
      }
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if the user exists
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.student) {
      const student = await this.studentRepo.findOneBy({ user });
      if (!student) throw new NotFoundException(`This user is not a student`);

      Object.assign(student, updateUserDto.student);
      await this.studentRepo.save(student);
    }

    // Update the user entity with new values
    Object.assign(user, updateUserDto);

    // Save the updated user to the database
    return this.userRepo.save(user);
  }

  async remove(id: number) {
    // Check if the user exists
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete the user from the database
    await this.userRepo.delete(id);

    return { message: `User with ID ${id} has been removed` };
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return this.userRepo.update({ id: userId }, { hashedRefreshToken });
  }
}
