import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { LabImage } from "src/entities/lab-image.entity";
import { CreateLabImageDto } from "./dto/create-lab-image.dto";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import * as FormData from "form-data";
import { catchError, lastValueFrom, throwError } from "rxjs";
import { ImageUploadRes } from "./types/image-upload";
import { AxiosError } from "axios";

@Injectable()
export class LabImageService {
  constructor(
    @InjectRepository(LabImage)
    private readonly labImageRepository: Repository<LabImage>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private readonly dockerApiUrl =
    this.configService.get<string>("dockerApi.url");

  async create(
    token: string,
    createLabImageDto: CreateLabImageDto,
    file: Express.Multer.File,
  ): Promise<LabImage> {
    if (!file || !file.buffer) {
      throw new BadRequestException("No file uploaded");
    }

    const form = new FormData();
    form.append("image", Buffer.from(file.buffer), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const { data } = await lastValueFrom(
      this.httpService
        .post<ImageUploadRes>(`${this.dockerApiUrl}/image`, form, {
          headers: { ...form.getHeaders(), Authorization: token },
        })
        .pipe(
          catchError((error: AxiosError) => {
            const status = error.response?.status || 500;
            const message = error.response?.data || "Internal server error";

            throw new HttpException({ error: message }, status);
          }),
        ),
    );

    const newLabImage = this.labImageRepository.create({
      imageName: createLabImageDto.image_name,
      imageId: data.ID,
    });

    return this.labImageRepository.save(newLabImage);
  }

  async findAll() {
    return this.labImageRepository.find();
  }

  async findOne(token: string, id: number) {
    const image = await this.labImageRepository.findOne({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException({ msg: "Image not found" });
    }

    try {
      await lastValueFrom(
        this.httpService
          .get(`${this.dockerApiUrl}/image/${image.imageId}`, {
            headers: { Authorization: token },
          })
          .pipe(
            catchError((error: AxiosError) => {
              const status = error.response?.status || 500;
              const message = error.response?.data || "Internal server error";

              throw new HttpException({ error: message }, status);
            }),
          ),
      );
    } catch (err) {
      throw new InternalServerErrorException(err);
    }

    return image;
  }

  async remove(token: string, id: number) {
    const image = await this.labImageRepository.findOne({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException({ msg: "Image not found" });
    }

    try {
      await lastValueFrom(
        this.httpService
          .delete(`${this.dockerApiUrl}/image/${image.imageId}`, {
            headers: { Authorization: token },
          })
          .pipe(
            catchError((error: AxiosError) => {
              return throwError(() => error);
            }),
          ),
      );
    } catch (err) {
      throw new InternalServerErrorException(err);
    }

    return this.labImageRepository.remove(image);
  }
}
