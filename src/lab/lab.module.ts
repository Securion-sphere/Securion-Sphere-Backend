import { Module } from '@nestjs/common';
import { LabService } from './lab.service';
import { LabController } from './lab.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lab } from 'src/entities/lab.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Lab])],
  controllers: [LabController],
  providers: [LabService],
})
export class LabModule {}
