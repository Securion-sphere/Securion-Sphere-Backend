import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateLabDto } from "./dto/create-lab.dto";
import { UpdateLabDto } from "./dto/update-lab.dto";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Lab } from "src/entities/lab.entity";
import { Supervisor } from "src/entities/supervisor.entity";
import { LabImage } from "src/entities/lab-image.entity";

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(Lab)
    private labRepository: Repository<Lab>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,
    @InjectRepository(LabImage)
    private readonly labImageRepository: Repository<LabImage>,
    private dataSource: DataSource,
  ) {}

  async create(createLabDto: CreateLabDto): Promise<Lab> {
    const { creatorId, labImageId, ...labData } = createLabDto;

    const supervisor = await this.supervisorRepository.findOneBy({
      id: creatorId,
    });

    if (!supervisor) {
      throw new Error("Supervisor not found");
    }

    const labImage = await this.labImageRepository.findOneBy({
      id: labImageId,
    });

    const newLab = this.labRepository.create({
      ...labData,
      creator: supervisor,
      labImage,
    });

    return this.labRepository.save(newLab);
  }

  async findAll() {
    const labs = await this.labRepository
      .createQueryBuilder("lab")
      .leftJoinAndSelect("lab.creator", "creator")
      .leftJoinAndSelect("creator.user", "user")
      .select([
        "lab.id",
        "lab.name",
        "lab.description",
        "lab.point",
        "lab.category",
        "lab.isReady",
        "creator.id",
        "user.nickName",
      ])
      .getMany();

    return labs.map((lab) => ({
      id: lab.id,
      name: lab.name,
      description: lab.description,
      point: lab.point,
      category: lab.category,
      isActive: lab.isReady,
      creatorName: lab.creator?.user?.nickName || "Unknown",
    }));
  }

  async findByName(name: string) {
    return this.labRepository.findOne({ where: { name } });
  }

  async update(name: string, updateLabDto: UpdateLabDto) {
    const lab = await this.findByName(name);
    if (!lab) {
      throw new NotFoundException();
    }

    const { creatorId, labImageId, ...labDto } = updateLabDto;

    // Fetch related entities (creator and labImage) by their IDs
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

    // Update the lab entity
    await this.labRepository.update(lab.id, {
      ...labDto,
      creator,
      labImage,
    });

    // Return the updated lab entity
    return this.labRepository.findOne({
      where: { id: lab.id },
      relations: ["labImage", "creator"],
    });
  }

  async remove(name: string) {
    const lab = await this.findByName(name);
    if (!lab) {
      throw new NotFoundException();
    }
    return this.labRepository.remove(lab);
  }

  async getSolved(name: string) {
    const solved = await this.dataSource.query(
      `SELECT COUNT(solved_machine) FROM student WHERE solved_machine = $1`,
      [name],
    );
    return solved;
  }
}
