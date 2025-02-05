import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "src/entities/student.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { AssignStudentDto } from "./dto/assign-student.dto";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,
  ) {}

  async findAll() {
    return this.studentRepository.find({
      relations: ["user", "solved_lab"],
      select: {
        id: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
          nickName: true,
          profile_img: true,
          email: true,
        },
        solved_lab: {
          labId: true,
          dateSolved: true,
        },
      },
    });
  }

  async findOne(userId: number) {
    return (
      (await this.studentRepository.findOne({
        where: {
          user: {
            id: userId,
          },
        },
        relations: ["user", "solved_lab"],
        select: {
          id: true,
          user: {
            id: true,
            firstName: true,
            lastName: true,
            nickName: true,
            email: true,
          },
          solved_lab: {
            labId: true,
            dateSolved: true,
          },
        },
      })) ??
      (() => {
        throw new NotFoundException("Student not found");
      })()
    );
  }

  async assignStudent(assignStudentDto: AssignStudentDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const [existStudent, existSupervisor] = await Promise.all([
      this.studentRepository.findOne({ where: { user } }),
      this.supervisorRepository.findOne({ where: { user } }),
    ]);

    if (existStudent)
      throw new ConflictException("This user is already a student");
    if (existSupervisor)
      throw new ConflictException("This user is already a supervisor");

    const student = this.studentRepository.create({
      user,
      ...assignStudentDto,
    });
    return this.studentRepository.save(student);
  }

  async unassignStudent(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const student = await this.studentRepository.findOne({ where: { user } });
    if (!student) throw new NotFoundException("This user is not a student yet");

    return this.studentRepository.delete(student);
  }
}
