import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Lab } from 'src/entities/lab.entity';
import { Supervisor } from 'src/entities/supervisor.entity';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(Lab)
    private labRepository: Repository<Lab>,
    @InjectRepository(Supervisor)
    private readonly supervisorRepository: Repository<Supervisor>,
    private dataSource: DataSource,
  ) {}

  async create(createLabDto: CreateLabDto): Promise<Lab> {
    const { creatorId, ...labData } = createLabDto;

    const supervisor = await this.supervisorRepository.findOneBy({ id: creatorId });

    if (!supervisor) {
      throw new Error('Supervisor not found');
    }

    const newLab = this.labRepository.create({
      ...labData,
      creator: supervisor,  
    });

    return await this.labRepository.save(newLab);
  }


  async findAll() {
    const labs = await this.labRepository.find({
      relations: ['creator', 'creator.user'],  
    });

    return labs.map(lab => ({
      id: lab.id,
      name: lab.name,
      description: lab.description,
      point: lab.point,
      category: lab.category,
      isActive: lab.isActive,
      creatorName: lab.creator?.user?.nickName || 'Unknown', 
    }));
}

  async findByName(name: string) {
    return await this.labRepository.findOne({ where: {name} })
  }

  async update(name: string, updateLabDto: UpdateLabDto) {
    const lab = await this.findByName(name);
    if(!lab) {
      throw new NotFoundException();
    } else {
      await this.labRepository.update(lab.id, updateLabDto)
      return await this.labRepository.findOne({ where : { id : lab.id }})
    }
    
  }

  async remove(name: string) {
    const lab = await this.findByName(name);
    if(!lab) {
      throw new NotFoundException();
    }
    return await this.labRepository.remove(lab);
  }

  async getSolved(name: string) {
    const solved = await this.dataSource.query(`SELECT COUNT(solved_machine) FROM student WHERE solved_machine = ${name}`);
    return solved
  }

}
