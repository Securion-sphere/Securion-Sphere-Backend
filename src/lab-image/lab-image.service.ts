import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { LabImage } from "src/entities/lab-image.entity";
import { CreateLabImageDto } from "./dto/create-lab-image.dto";
import { UpdateLabImageDto } from "./dto/update-lab-image.dto";

@Injectable()
export class LabImageService {
  constructor(
    @InjectRepository(LabImage)
    private labImageRepository: Repository<LabImage>,
  ) {}

  async create(createLabImageDto: CreateLabImageDto): Promise<LabImage> {
    const newLabImage = this.labImageRepository.create(createLabImageDto);
    return this.labImageRepository.save(newLabImage);
  }

  async findAll() {
    return this.labImageRepository.find();
  }

  async findByName(name: string) {
    return this.labImageRepository.findOne({ where: { name } });
  }

  async update(name: string, updateLabImageDto: UpdateLabImageDto) {
    const lab = await this.findByName(name);
    if (!lab) {
      throw new NotFoundException();
    } else {
      await this.labImageRepository.update(lab.id, updateLabImageDto);
      return this.labImageRepository.findOne({ where: { id: lab.id } });
    }
  }

  async remove(name: string) {
    const lab = await this.findByName(name);
    if (!lab) {
      throw new NotFoundException();
    }
    return this.labImageRepository.remove(lab);
  }
}
