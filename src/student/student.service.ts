import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Student } from "src/entities/student.entity";
import { Repository } from "typeorm";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  async findAll() {
    const students = await this.studentRepository.find({
      relations: ["user", "solved_lab", "solved_lab.lab"],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          nickName: true,
        },
        solvedLab: {
          lab: {
            id: true,
            name: true,
            point: true,
          },
          solvedAt: true,
        },
      },
    });

    return students.map((student) => {
      const totalScore = student.solvedLab.reduce((sum, solvedLab) => {
        return sum + (solvedLab.lab?.point || 0);
      }, 0);

      return {
        ...student,
        totalScore,
      };
    });
  }

  async findOne(studentId: number) {
    const student = await this.studentRepository.findOne({
      where: { user: { id: studentId } },
      relations: ["user", "solved_lab", "solved_lab.lab"],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          nickName: true,
        },
        solvedLab: {
          lab: {
            id: true,
            name: true,
            point: true,
          },
          solvedAt: true,
        },
      },
    });

    if (!student) {
      throw new NotFoundException("Student not found");
    }

    const totalScore = student.solvedLab.reduce((sum, solvedLab) => {
      return sum + (solvedLab.lab?.point || 0);
    }, 0);

    return {
      ...student,
      totalScore,
    };
  }
}
