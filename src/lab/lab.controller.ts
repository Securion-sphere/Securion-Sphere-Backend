import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LabService } from './lab.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';

@Controller('lab')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post()
  create(@Body() createLabDto: CreateLabDto) {
    return this.labService.create(createLabDto);
  }

  @Get()
  findAll() {
    return this.labService.findAll();
  }

  @Patch(':name')
  update(@Param('name') name: string, @Body() updateLabDto: UpdateLabDto) {
    return this.labService.update(name, updateLabDto);
  }

  @Delete(':name')
  remove(@Param('name') name: string) {
    return this.labService.remove(name);
  }
}
