import { HttpException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivatedLab } from "src/entities/actived-lab.entity";
import { Repository } from "typeorm";
import { CreateLabInstanceDto } from "./dto/active-lab.dto";
import { randomBytes, randomInt } from "crypto";
import { ConfigService } from "@nestjs/config";
import { User } from "src/entities/user.entity";
import { Lab } from "src/entities/lab.entity";
import { SubmitFlagDto } from "./dto/submit-flag.dto";
import { CreateLabInstanceReturnDto } from "./dto/create-lab-instance-return.dto";
import { Solvation } from "src/entities/solvation.entity";
import { HttpService } from "@nestjs/axios";
import { catchError, lastValueFrom } from "rxjs";
import { ContainerStartRes } from "./types/containerStartRes";
import { AxiosError } from "axios";

@Injectable()
export class ActivedLabService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(ActivatedLab)
    private activeLabRepository: Repository<ActivatedLab>,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lab)
    private labRepository: Repository<Lab>,
    @InjectRepository(Solvation)
    private solvationRepository: Repository<Solvation>,
  ) {}

  private readonly dockerApiUrl =
    this.configService.get<string>("dockerApi.url");

  async active(
    token: string,
    createLabInstanceDto: CreateLabInstanceDto & { userId: number },
  ): Promise<CreateLabInstanceReturnDto> {
    const port = randomInt(40000, 50001);
    const ip = this.configService.get<string>("dockerApi.host");
    const flag = "flag{" + randomBytes(48).toString("hex") + "}";
    const owner = await this.userRepository.findOneBy({
      id: createLabInstanceDto.userId,
    });

    if (!owner) {
      throw new Error("User not found");
    }

    const lab = await this.labRepository.findOne({
      where: { id: createLabInstanceDto.labId },
      relations: ["labImage"],
    });

    if (!lab) {
      throw new Error("Lab not found");
    }

    const existingInstance = await this.activeLabRepository.find({
      where: { instanceOwner: owner },
    });

    if (existingInstance.length > 0) {
      throw new Error("User already have existing instance.");
    }
    const { data } = await lastValueFrom(
      this.httpService
        .post<ContainerStartRes>(
          `${this.dockerApiUrl}/container`,
          {
            image: lab.labImage.image_id,
            container_port: 80,
            host_port: port,
            flag: flag,
          },
          { headers: { Authorization: token } },
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
    this.userRepository.update(createLabInstanceDto.userId, {
      activate_lab: newActivedLab,
    });

    const {
      id: resId,
      instanceOwner,
      instanceLab,
      ip: resIp,
      port: resPort,
    } = newActivedLab;
    return { id: resId, instanceOwner, instanceLab, ip: resIp, port: resPort };
  }

  async deactivate(token: string, userId: number) {
    const owner = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!owner) {
      throw new Error("User not found");
    }

    await this.userRepository.update(userId, {
      activate_lab: null,
    });

    const instance = await this.activeLabRepository.findOne({
      where: { instanceOwner: owner },
    });

    if (!instance) {
      throw new NotFoundException("User haven't create instance yet");
    }

    await lastValueFrom(
      this.httpService
        .delete<ContainerStartRes>(
          `${this.dockerApiUrl}/container/${instance.containerId}`,
          { headers: { Authorization: token } },
        )
        .pipe(
          catchError((error: AxiosError) => {
            const status = error.response?.status || 500;
            const message = error.response?.data || "Internal server error";

            throw new HttpException({ error: message }, status);
          }),
        ),
    );

    await this.activeLabRepository.delete(instance.id);

    return { msg: "Successfully stop instance" };
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

    if (activatedLab.flag === flag) {
      if (owner.student) {
        const solvation = this.solvationRepository.create({
          studentId: owner.student.id,
          labId: activatedLab.instanceLab.id,
          student: owner.student,
          lab: activatedLab.instanceLab,
          dateSolved: new Date(), // Assign the current date
        });
        await this.solvationRepository.save(solvation);
        return { msg: "Flag is correct" };
      }
      return {
        msg: "Flag is correct, but you are supervisor solvation will not appear",
      };
    } else {
      return { msg: "Flag is not correct" };
    }
  }

  async getInstance(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    const instance = await this.activeLabRepository.findOne({
      where: { instanceOwner: user },
    });

    if (!instance) {
      throw new NotFoundException("User haven't create instance yet");
    }

    const { id: instanceId, instanceOwner, instanceLab, ip, port } = instance;

    return { id: instanceId, instanceOwner, instanceLab, ip, port };
  }
}
