import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Lab } from 'src/entities/lab.entity';

@Injectable()
export class LabService {
  constructor(
    @InjectRepository(Lab)
    private labRepository: Repository<Lab>,
    private dataSource: DataSource,
  ) {}

  async create(createLabDto: CreateLabDto) {
    const lab = this.labRepository.create(createLabDto);
    return await this.labRepository.save(lab);
  }

  async findAll() {
    return await this.labRepository.find();
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
