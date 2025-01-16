import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { LabImage } from "src/entities/lab-image.entity";
import { CreateLabImageDto } from "./dto/create-lab-image.dto";
import { UpdateLabImageDto } from "./dto/update-lab-image.dto";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import * as FormData from "form-data";
import { catchError, lastValueFrom } from "rxjs";
import { ImageUploadRes } from "./types/imageUpload";
import { AxiosError } from "axios";

@Injectable()
export class LabImageService {
  dockerApiUrl = this.configService.get<string>("docker.api");

  constructor(
    @InjectRepository(LabImage)
    private readonly labImageRepository: Repository<LabImage>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createLabImageDto: CreateLabImageDto,
    file: Express.Multer.File,
  ): Promise<LabImage> {
    if (!file || !file.buffer) {
      throw new BadRequestException("No file uploaded");
    }

    const form = new FormData();
    form.append("file", Buffer.from(file.buffer), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const { data } = await lastValueFrom(
      this.httpService
        .post<ImageUploadRes>(this.dockerApiUrl + "/image", form)
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );

    const newLabImage = this.labImageRepository.create({
      image_id: data.Name,
      ...createLabImageDto,
    });
    return this.labImageRepository.save(newLabImage);
  }

  async findAll() {
    return this.labImageRepository.find();
  }

  async findByName(name: string) {
    return this.labImageRepository.findOne({ where: { name } });
  }

  async update(
    id: string,
    updateLabImageDto: UpdateLabImageDto,
    file: Express.Multer.File,
  ) {
    const form = new FormData();
    form.append("file", Buffer.from(file.buffer), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    // const { data } = await lastValueFrom(
    //   this.httpService
    //     .<ImageUploadRes>(this.dockerApiUrl + "/image", form)
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         throw error;
    //       }),
    //     ),
    // );

    const lab = await this.findByName(id);
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
