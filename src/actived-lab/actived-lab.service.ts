import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ActivatedLab } from "src/entities/actived-lab.entity";
import { Repository } from "typeorm";
import { CreateLabInstanceDto } from "./dto/active-lab.dto";
import { randomBytes, randomInt } from "crypto";
import { ConfigService } from "@nestjs/config";
import { User } from "src/entities/user.entity";
import { Lab } from "src/entities/lab.entity";
import { DeleteLabInstanceDto } from "./dto/deactivated-lab.dto";
import { SubmitFlagDto } from "./dto/submit-flag.dto";

@Injectable()
export class ActivedLabService {
  constructor(
    @InjectRepository(ActivatedLab)
    private activeLabRepository: Repository<ActivatedLab>,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lab)
    private labRepository: Repository<Lab>,
  ) {}

  async active(
    createLabInstanceDto: CreateLabInstanceDto,
  ): Promise<ActivatedLab> {
    const port = randomInt(30000, 50001);
    const ip = this.configService.get<string>("docker.host");
    const flag = randomBytes(48).toString("hex");
    const owner = await this.userRepository.findOneBy({
      id: createLabInstanceDto.userId,
    });

    if (!owner) {
      throw new Error("User not found");
    }

    const lab = await this.labRepository.findOneBy({
      id: createLabInstanceDto.labId,
    });

    if (!lab) {
      throw new Error("Lab not found");
    }

    const newActivedLab = this.activeLabRepository.create({
      instanceOwner: owner,
      instanceLab: lab,
      ip,
      port,
      flag,
    });

    await this.activeLabRepository.save(newActivedLab);
    this.userRepository.update(createLabInstanceDto.userId, {
      actived_machine: newActivedLab,
    });

    return newActivedLab;
  }

  async deactivate(deleteLabInstanceDto: DeleteLabInstanceDto) {
    const owner = await this.userRepository.findOneBy({
      id: deleteLabInstanceDto.userId,
    });

    if (!owner) {
      throw new Error("User not found");
    }

    this.userRepository.update(deleteLabInstanceDto.userId, {
      actived_machine: null,
    });

    const lab = await this.activeLabRepository.findOne({
      where: { instanceOwner: owner },
    });

    return this.activeLabRepository.remove(lab);
  }

  async submitFlag(submitFlagDto: SubmitFlagDto) {
    const { userId, flag } = submitFlagDto;

    const owner = await this.userRepository.findOneBy({ id: userId });

    const activatedLab = await this.activeLabRepository.findOne({
      where: { flag, instanceOwner: owner },
    });

    if (!activatedLab) {
      return { msg: "Flag is not correct" };
    } else {
      await this.userRepository.update(userId, {
        actived_machine: null,
      });

      const lab = await this.activeLabRepository.findOne({
        where: { instanceOwner: owner },
      });

      this.activeLabRepository.remove(lab);

      return { msg: "Flag is correct" };
    }
  }
}
