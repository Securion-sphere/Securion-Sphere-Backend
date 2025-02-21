import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository } from "typeorm";
import { User } from "src/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { Role } from "./types/role";
import { Parser } from "csv-parse";
import { AddEmailsDto } from "./dto/add-email.dto";
import { PreLoginUser } from "src/entities/pre-login-user.entity";
import { PreLoginUserDto } from "./dto/pre-login-user.dto";
import { Readable } from "stream";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepo: Repository<Supervisor>,
    @InjectRepository(PreLoginUser)
    private readonly preLoginUserRepo: Repository<PreLoginUser>,
  ) {}

  private async parseCSV(file: Express.Multer.File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const emails: string[] = [];
      const parser = new Parser({
        delimiter: ",",
        skip_empty_lines: true,
      });

      parser.on("readable", function () {
        let record;
        while ((record = parser.read()) !== null) {
          if (record[0]) {
            emails.push(record[0].trim());
          }
        }
      });

      parser.on("error", function (err) {
        reject(err);
      });

      parser.on("end", function () {
        resolve(emails);
      });

      const stream = Readable.from(file.buffer);
      stream.pipe(parser);
    });
  }

  async bulkAddUsersFromCsv(
    file: Express.Multer.File,
    role: "student" | "supervisor" = "student",
  ): Promise<{
    success: boolean;
    results: Array<{ email: string; status: string }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const results: Array<{ email: string; status: string }> = [];
    let successful = 0;
    let failed = 0;

    try {
      const emails = await this.parseCSV(file);
      const studentRegex = /^[a-zA-Z0-9._%+-]+@kmitl\.ac\.th$/;
      const supervisorRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      for (const email of emails) {
        try {
          if (!email.trim()) {
            continue;
          }

          // Validate email format based on role
          const isValidFormat =
            role === "student"
              ? studentRegex.test(email)
              : supervisorRegex.test(email);

          if (!isValidFormat) {
            results.push({
              email,
              status: `Failed: Invalid email format for ${role} role`,
            });
            failed++;
            continue;
          }

          const existingPreLoginUser = await this.preLoginUserRepo.findOne({
            where: { email },
          });

          const existingUser = await this.userRepository.findOne({
            where: { email },
          });

          if (existingPreLoginUser) {
            results.push({
              email,
              status: "Failed: Email already exists in pre-login users",
            });
            failed++;
          } else if (existingUser) {
            results.push({
              email,
              status: "Failed: Email already exists in registered users",
            });
            failed++;
          } else {
            const preLoginUser = this.preLoginUserRepo.create({
              email,
              role,
            });

            await this.preLoginUserRepo.save(preLoginUser);

            results.push({
              email,
              status: "Success: Email added to pre-login users",
            });
            successful++;
          }
        } catch (error) {
          results.push({
            email,
            status: `Failed: ${error.message}`,
          });
          failed++;
        }
      }

      return {
        success: successful > 0,
        results,
        summary: {
          total: successful + failed,
          successful,
          failed,
        },
      };
    } catch (error) {
      throw new Error(`Failed to process CSV file: ${error.message}`);
    }
  }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    const resUser = await this.userRepository.save(user);

    let roleRes: Role = null;

    if (createUserDto.role === "student") {
      await this.studentRepo.save(
        this.studentRepo.create({
          user: resUser,
          solvedLab: [],
        }),
      );
      roleRes = { role: "student", user: resUser };
    } else if (createUserDto.role === "supervisor") {
      await this.supervisorRepo.save(
        this.supervisorRepo.create({
          user: resUser,
        }),
      );
      roleRes = { role: "supervisor", user: resUser };
    }

    return roleRes;
  }

  async addEmails(addEmailsDto: AddEmailsDto): Promise<{
    success: boolean;
    results: Array<{ email: string; status: string }>;
  }> {
    const results: Array<{ email: string; status: string }> = [];
    const { emails, role = "student" } = addEmailsDto;

    for (const email of emails) {
      try {
        // Check if email already exists in pre-login-user table
        const existingPreLoginUser = await this.preLoginUserRepo.findOne({
          where: { email },
        });

        // Check if email already exists in user table
        const existingUser = await this.userRepository.findOne({
          where: { email },
        });

        if (existingPreLoginUser) {
          results.push({
            email,
            status: "Failed: Email already exists in pre-login users",
          });
        } else if (existingUser) {
          results.push({
            email,
            status: "Failed: Email already exists in registered users",
          });
        } else {
          const preLoginUser = this.preLoginUserRepo.create({
            email,
            role,
          });

          await this.preLoginUserRepo.save(preLoginUser);

          results.push({
            email,
            status: "Success: Email added to pre-login users",
          });
        }
      } catch (error) {
        results.push({
          email,
          status: `Failed: ${error.message}`,
        });
      }
    }

    return {
      success: results.some((result) => result.status.startsWith("Success")),
      results,
    };
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findAll() {
    const users = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.student", "student")
      .leftJoinAndSelect("student.solvedLab", "solvation")
      .leftJoinAndSelect("solvation.lab", "solvedLab")
      .leftJoinAndSelect("user.supervisor", "supervisor")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.nickName",
        "user.profileImg",
        "user.email",
        "supervisor.userId",
        "student.userId",
        "solvation.labId",
        "solvedLab.id",
        "solvedLab.name",
        "solvedLab.category",
        "solvedLab.point",
      ])
      .getMany();

    return users.map((user) => {
      if (user.supervisor) {
        return {
          ...user,
          role: "supervisor",
          supervisor: undefined,
          student: undefined,
        };
      } else if (user.student) {
        const totalScore =
          user.student?.solvedLab?.reduce((score, solvation) => {
            return score + (solvation.lab?.point || 0);
          }, 0) || 0;
        return {
          ...user,
          role: "student",
          student: {
            score: totalScore,
            solvedLab: user.student.solvedLab ?? [],
          },
          supervisor: undefined,
        };
      }
      return {
        ...user,
        supervisor: undefined,
        student: undefined,
        role: "who_are_you?",
      };
    });
  }

  async findPreLoginUserByEmail(
    email: string,
  ): Promise<PreLoginUserDto | null> {
    return this.preLoginUserRepo.findOne({ where: { email } });
  }

  async findAllPreLoginUser(): Promise<PreLoginUserDto[]> {
    const users = await this.preLoginUserRepo.find();
    return users;
  }

  async removePreLoginUser(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.preLoginUserRepo.findOne({ where: { email } });
      if (!user) {
        return { success: false, message: "User not found" };
      }
      await this.preLoginUserRepo.remove(user);
      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      return {
        success: false,
        message: error.message || "An error occurred while deleting the user",
      };
    }
  }

  async findOne(id: number) {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.student", "student")
      .leftJoinAndSelect("student.solvedLab", "solvation")
      .leftJoinAndSelect("solvation.lab", "solvedLab")
      .leftJoinAndSelect("user.supervisor", "supervisor")
      .select([
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.nickName",
        "user.profileImg",
        "user.email",
        "supervisor.userId",
        "student.userId",
        "solvation.labId",
        "solvedLab.id",
        "solvedLab.name",
        "solvedLab.category",
        "solvedLab.point",
      ])
      .where("user.id = :id", { id })
      .getOne();

    if (!user) {
      throw new NotFoundException("User is not found");
    }

    if (user.supervisor) {
      return {
        ...user,
        role: "supervisor",
        supervisor: undefined,
        student: undefined,
      };
    } else if (user.student) {
      const totalScore =
        user.student?.solvedLab?.reduce((score, solvation) => {
          return score + (solvation.lab?.point || 0);
        }, 0) || 0;
      return {
        ...user,
        role: "student",
        student: {
          score: totalScore,
          solvedLab: user.student.solvedLab ?? [],
        },
        supervisor: undefined,
      };
    }

    return {
      ...user,
      supervisor: undefined,
      student: undefined,
      role: "who_are_you?",
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Check if the user exists
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Save the updated user to the database
    return this.userRepository.update({ id }, updateUserDto);
  }

  async countUsers(): Promise<number> {
    const count = await this.userRepository.count();
    return count;
  }

  async remove(id: number) {
    // Check if the user exists
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Delete the user from the database
    await this.userRepository.delete(id);

    return { message: `User with ID ${id} has been removed` };
  }

  async updateHashedRefreshToken(userId: number, hashedRefreshToken: string) {
    return this.userRepository.update({ id: userId }, { hashedRefreshToken });
  }
}
