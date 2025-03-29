import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivedLab } from "src/entities/actived-lab.entity";
import { Repository } from "typeorm";
import { CreateLabInstanceDto } from "./dto/active-lab.dto";
import { randomBytes, randomInt } from "crypto";
import { ConfigService } from "@nestjs/config";
import { User } from "src/entities/user.entity";
import { Lab } from "src/entities/lab.entity";
import { SubmitFlagDto } from "./dto/submit-flag.dto";
import { AxiosError } from "axios";
import { Solvation } from "src/entities/solvation.entity";
import { HttpService } from "@nestjs/axios";
import { catchError, lastValueFrom } from "rxjs";
import { ContainerResponse } from "./types/container-response";

@Injectable()
export class ActivedLabService {
  constructor(
    @InjectRepository(ActivedLab)
    private activeLabRepository: Repository<ActivedLab>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lab)
    private labRepository: Repository<Lab>,
    @InjectRepository(Solvation)
    private solvationRepository: Repository<Solvation>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private readonly dockerApiUrl =
    this.configService.get<string>("dockerApi.url");

  async active(
    createLabInstanceDto: CreateLabInstanceDto & { userId: number },
    token: string,
  ) {
    const port = randomInt(40000, 50001);
    const ip = this.configService.get<string>("dockerApi.host");
    const flag = "flag{" + randomBytes(16).toString("hex") + "}";
    const owner = await this.userRepository.findOneBy({
      id: createLabInstanceDto.userId,
    });

    if (!owner) {
      throw new NotFoundException("The user's request is not found");
    }

    const lab = await this.labRepository.findOne({
      where: { id: createLabInstanceDto.labId },
      relations: ["labImage"],
    });
    if (!lab) {
      throw new NotFoundException("Lab is not found");
    }

    const existingInstance = await this.activeLabRepository.find({
      where: { instanceOwner: owner },
    });

    if (existingInstance.length > 0) {
      throw new ConflictException(
        "User already has existing instance, please stop the instance before create another instance",
      );
    }

    const { data } = await lastValueFrom(
      this.httpService
        .post<ContainerResponse>(
          `${this.dockerApiUrl}/container`,
          {
            image: lab.labImage.imageId,
            container_port: 80,
            host_port: port,
            flag: flag,
          },
          {
            headers: { Authorization: token },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            const status = error.response?.status || 500;
            const message = error.response?.data || "Internal server error";

            throw new HttpException({ error: message }, status);
          }),
        ),
    );

    const newActivedLab = this.activeLabRepository.create({
      instanceOwner: owner,
      instanceLab: lab,
      containerId: data.ID,
      ip,
      port,
      flag,
    });

    await this.activeLabRepository.save(newActivedLab);

    await this.userRepository.update(createLabInstanceDto.userId, {
      activedLab: newActivedLab,
    });

    return {
      instanceId: newActivedLab.id,
      instanceLab: {
        id: newActivedLab.instanceLab.id,
        name: newActivedLab.instanceLab.name,
      },
      ip: newActivedLab.ip,
      port: newActivedLab.port,
    };
  }

  async deactivate(userId: number, token: string) {
    const owner = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!owner) {
      throw new NotFoundException("The user's request is not found");
    }

    await this.userRepository.update(userId, {
      activedLab: null,
    });

    const instance = await this.activeLabRepository.findOne({
      where: { instanceOwner: owner },
    });

    if (!instance) {
      throw new ConflictException("User have not create any instance yet");
    }

    await lastValueFrom(
      this.httpService
        .delete(`${this.dockerApiUrl}/container/${instance.containerId}`, {
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

    await this.activeLabRepository.delete(instance.id);

    return { msg: "Successfully stop user's instance" };
  }

  async submitFlag(submitFlagDto: SubmitFlagDto & { userId: number }) {
    const { userId, flag } = submitFlagDto;
    const owner = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["student"],
    });

    if (!owner) {
      throw new NotFoundException("User not found");
    }

    const activatedLab = await this.activeLabRepository.findOne({
      where: { instanceOwner: owner },
      relations: ["instanceLab"],
    });

    if (!activatedLab) {
      throw new NotFoundException("User haven't create instance yet");
    }

    const isCorrectFlag = activatedLab.flag === flag;
    if (!isCorrectFlag) {
      return { msg: "Flag is not correct" };
    }

    if (!owner.student) {
      return {
        msg: "Flag is correct, but you are a Supervisor. The record will not be stored",
      };
    }

    try {
      const solvation = this.solvationRepository.create({
        student: owner.student,
        lab: activatedLab.instanceLab,
        solvedAt: new Date(),
      });
      await this.solvationRepository.save(solvation);
    } catch (err) {
      throw new InternalServerErrorException(
        "Cannot save the record. Please try again",
      );
    }

    return { msg: "Flag is correct" };
  }

  async getInstance(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    const instance = await this.activeLabRepository.findOne({
      where: { instanceOwner: user },
      select: {
        id: true,
        containerId: true,
        ip: true,
        port: true,
        instanceLab: {
          id: true,
          name: true,
          category: true,
          point: true,
        },
      },
      relations: ["instanceLab"],
    });

    if (!instance) {
      throw new NotFoundException("User haven't create instance yet");
    }

    return instance;
  }
}
