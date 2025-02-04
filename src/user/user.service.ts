import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { Role } from "./types/role";
import { AddEmailsDto } from "./dto/add-email.dto";

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

  async addEmails(addEmailsDto: AddEmailsDto): Promise<{
    success: boolean;
    results: Array<{ email: string; status: string }>;
  }> {
    const results = [];

    for (const email of addEmailsDto.emails) {
      try {
        const existingUser = await this.userRepo.findOne({
          where: { email },
        });

        if (existingUser) {
          results.push({ email, status: "Email already exists" });
          continue;
        }

        const user = await this.userRepo.save({
          email,
          firstName: null,
          lastName: null,
        });

        if (addEmailsDto.role === "student") {
          await this.studentRepo.save({
            user: { id: user.id },
          });
        } else {
          await this.supervisorRepo.save({
            user: { id: user.id },
          });
        }

        results.push({ email, status: "Added successfully" });
      } catch (error) {
        console.log(error);
        results.push({ email, status: "Failed to add" });
      }
    }

    return {
      success: true,
      results,
    };
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: {
        email,
      },
    });
  }

  async findAll() {
    const users = await this.userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.student", "student")
      .leftJoinAndSelect("student.solved_lab", "solvation")
      .leftJoinAndSelect("solvation.lab", "solvedLab")
      .leftJoinAndSelect("user.supervisor", "supervisor")
      .leftJoinAndSelect("supervisor.labs", "createdLab")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.nickName",
        "user.profile_img",
        "user.email",
        "student",
        "solvation",
        "solvedLab.id",
        "solvedLab.name",
        "solvedLab.category",
        "solvedLab.point",
        "supervisor",
        "createdLab.id",
        "createdLab.name",
        "createdLab.category",
        "createdLab.point",
      ])
      .getMany();

    return users
      .filter((user) => user.firstName || user.lastName) // Only keep users with firstName or lastName
      .map((user) => {
        if (user) {
          if (!user.student) {
            delete user.student;
          }
          if (!user.supervisor) {
            delete user.supervisor;
          }
        }

        let totalScore = 0;
        if (user.student) {
          totalScore = user.student.solved_lab.reduce((score, solvation) => {
            return score + solvation.lab.point;
          }, 0);
        }

        return {
          ...user,
          ...(user.supervisor ? { supervisor: user.supervisor } : {}),
          ...(user.student
            ? {
                student: {
                  year: user.student.year,
                  score: totalScore,
                  solved_lab: user.student.solved_lab,
                },
              }
            : {}),
        };
      });
  }

  async findOne(id: number) {
    const user = await this.userRepo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.student", "student")
      .leftJoinAndSelect("student.solved_lab", "solvation")
      .leftJoinAndSelect("solvation.lab", "solvedLab")
      .leftJoinAndSelect("user.supervisor", "supervisor")
      .leftJoinAndSelect("supervisor.labs", "createdLab")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.nickName",
        "user.profile_img",
        "user.email",
        "student",
        "solvation",
        "solvedLab.id",
        "solvedLab.name",
        "solvedLab.category",
        "solvedLab.point",
        "supervisor",
        "createdLab.id",
        "createdLab.name",
        "createdLab.category",
        "createdLab.point",
      ])
      .where("user.id = :id", { id })
      .getOne();

    if (user) {
      if (!user.student) {
        delete user.student;
      }
      if (!user.supervisor) {
        delete user.supervisor;
      }
    }

    let totalScore = 0;
    if (user && user.student) {
      totalScore = user.student.solved_lab.reduce((score, solvation) => {
        return score + solvation.lab.point; // Add up the points for each solved lab
      }, 0);
    }

    return {
      ...user,
      ...(user.student && {
        student: {
          year: user.student.year,
          score: totalScore,
          solved_lab: user.student.solved_lab,
        },
      }),
    };
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

  async countUsers(): Promise<number> {
    const count = await this.userRepo.count();
    return count;
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
