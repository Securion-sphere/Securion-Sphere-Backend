import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateLabDto } from "./dto/create-lab.dto";
import { UpdateLabDto } from "./dto/update-lab.dto";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Lab } from "src/entities/lab.entity";
import { LabImage } from "src/entities/lab-image.entity";
import { User } from "src/entities/user.entity";

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(Lab)
    private readonly labRepository: Repository<Lab>,
    @InjectRepository(LabImage)
    private readonly labImageRepository: Repository<LabImage>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

<<<<<<< HEAD
  async create(createLabDto: CreateLabDto): Promise<Lab> {
    const { lab_image_id: labImageId, ...labData } = createLabDto;
=======
  async create(createLabDto: CreateLabDto & { userId: number }): Promise<Lab> {
    const { userId, labImageId, ...labData } = createLabDto;

    const user = await this.userRepository.findOneBy({ id: userId });

    const supervisor = await this.supervisorRepository.findOneBy({
      user: user,
    });

    if (!supervisor) {
      throw new Error("Supervisor not found");
    }
>>>>>>> origin/dev

    const labImage = await this.labImageRepository.findOneBy({
      id: labImageId,
    });

    const newLab = this.labRepository.create({
      ...labData,
      labImage,
    });

    return this.labRepository.save(newLab);
  }

  async findAll() {
    const labs = await this.labRepository
      .createQueryBuilder("lab")
      .leftJoinAndSelect("lab.solved_by", "solvation")
      .leftJoinAndSelect("solvation.student", "student")
      .leftJoinAndSelect("student.user", "user")
      .select([
        "lab.id",
        "lab.name",
        "lab.description",
        "lab.point",
        "lab.category",
        "lab.isReady",
        "solvation.solved_at",
        "student.user",
        "user.nick_name",
      ])
      .getMany();

    return labs;
  }

  async findOne(id: number) {
    const lab = await this.labRepository
      .createQueryBuilder("lab")
      .leftJoinAndSelect("lab.solved_by", "solvation")
      .leftJoinAndSelect("solvation.student", "student")
      .leftJoinAndSelect("student.user", "studentUser")
      .select([
        "lab.id",
        "lab.name",
        "lab.description",
        "lab.point",
        "lab.category",
        "lab.isReady",
        "user.nickName",
        "solvation",
        "student",
        "studentUser.nickName",
      ])
      .where("lab.id = :id", { id })
      .getOne();

    if (!lab) {
      throw new NotFoundException("Lab not found");
    }

    return {
      id: lab.id,
      name: lab.name,
      description: lab.description,
      point: lab.point,
      category: lab.category,
      isReady: lab.isReady,
      solvedBy: lab.solvedBy,
    };
  }

  async updateById(id: number, updateLabDto: UpdateLabDto) {
    const lab = await this.labRepository.findOne({ where: { id } });
    if (!lab) {
      throw new NotFoundException();
    }

<<<<<<< HEAD
    const { ...updatedData } = updateLabDto;
=======
    const { creatorId, labImageId, ...labDto } = updateLabDto;

    const creator = await this.supervisorRepository.findOne({
      where: { id: creatorId },
    });

    if (!creator) {
      throw new NotFoundException(`Creator with id ${creatorId} not found`);
    }

    const labImage = await this.labImageRepository.findOne({
      where: { id: labImageId },
    });
    if (!labImage) {
      throw new NotFoundException(`LabImage with id ${labImageId} not found`);
    }
>>>>>>> origin/dev

    await this.labRepository.update(id, {
      ...updatedData,
    });

    return this.labRepository.findOne({
      where: { id },
      relations: ["labImage"],
    });
  }

  async removeById(id: number) {
    const lab = await this.labRepository.findOne({ where: { id } });
    if (!lab) {
      throw new NotFoundException();
    }
    return this.labRepository.remove(lab);
  }

  async getSolved(id: number): Promise<number> {
    const solved = await this.dataSource.query(
      `SELECT COUNT("studentId") FROM solvation WHERE "labId" = $1;`,
      [id],
    );
    return solved;
  }
}
