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
import { catchError, lastValueFrom, throwError } from "rxjs";
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
            return throwError(() => error);
          }),
        ),
    );

    const newLabImage = this.labImageRepository.create({
      image_name: data.Name,
      ...createLabImageDto,
    });
    return this.labImageRepository.save(newLabImage);
  }

  async findAll() {
    return this.labImageRepository.find();
  }

  async findByName(name: string) {
    return this.labImageRepository.findOne({ where: { image_name: name } });
  }

  async update(id: string, updateLabImageDto: UpdateLabImageDto) {
    // const form = new FormData();
    // form.append("file", Buffer.from(file.buffer), {
    //   filename: file.originalname,
    //   contentType: file.mimetype,
    // });

    // const { data } = await lastValueFrom(
    //   this.httpService
    //     .<ImageUploadRes>(this.dockerApiUrl + "/image", form)
    //     .pipe(
    //       catchError((error: AxiosError) => {
    //         throw error;
    //       }),
    //     ),
    // );

    const labImage = await this.findByName(id);
    if (!labImage) {
      throw new NotFoundException();
    } else {
      return this.labImageRepository.update(labImage.id, updateLabImageDto);
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
