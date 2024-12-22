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
import { CreateLabInstanceReturnDto } from "./dto/create-lab-instance-return.dto";
import axios from "axios";
import { Solvation } from "src/entities/solvation.entity";

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
    @InjectRepository(Solvation)
    private solvationRepository: Repository<Solvation>,
  ) {}

  async active(
    createLabInstanceDto: CreateLabInstanceDto,
  ): Promise<CreateLabInstanceReturnDto> {
    const port = randomInt(30000, 50001);
    const ip = this.configService.get<string>("docker.host");
    const flag = "flag{" + randomBytes(48).toString("hex") + "}";
    const dockerApiUrl = this.configService.get<string>("docker.api");
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
    let res;
    try {
      res = await axios.post(dockerApiUrl + "/container", {
        image: lab.labImage.image_id,
        container_port: (80).toString(),
        host_port: port.toString(),
        flag: flag,
      });
    } catch (err) {
      throw new Error("Cannot create container.");
    }
    const newActivedLab = this.activeLabRepository.create({
      instanceOwner: owner,
      instanceLab: lab,
      containerId: res.data.containerId,
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

  async deactivate(deleteLabInstanceDto: DeleteLabInstanceDto) {
    const owner = await this.userRepository.findOneBy({
      id: deleteLabInstanceDto.userId,
    });

    const dockerApiUrl = this.configService.get<string>("docker.api");

    if (!owner) {
      throw new Error("User not found");
    }

    await this.userRepository.update(deleteLabInstanceDto.userId, {
      activate_lab: null,
    });

    const instance = await this.activeLabRepository.findOne({
      where: { instanceOwner: owner },
    });

    if (!instance) {
      throw new Error("User haven't create instance yet");
    }

    try {
      await axios.delete(dockerApiUrl + "/container", {
        data: { container_id: instance.containerId },
      });
    } catch (err) {
      throw new Error("Cannot Stop Container");
    }

    await this.activeLabRepository.delete(instance.id);

    return { msg: "Successfully stop instance" };
  }

  async submitFlag(submitFlagDto: SubmitFlagDto) {
    const { userId, flag } = submitFlagDto;
    const owner = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["student"],
    });

    if (!owner) {
      return { msg: "User not found" };
    }

    const activatedLab = await this.activeLabRepository.findOne({
      where: { instanceOwner: owner },
      relations: ["instanceLab"],
    });

    if (!activatedLab) {
      return { msg: "User is not create instance yet." };
    }

    if (activatedLab.flag === flag) {
      const solvation = this.solvationRepository.create({
        studentId: owner.student.id,
        labId: activatedLab.instanceLab.id,
        student: owner.student,
        lab: activatedLab.instanceLab,
        dateSolved: new Date(), // Assign the current date
      });
      await this.solvationRepository.save(solvation);
      return { msg: "Flag is correct" };
    } else {
      return { msg: "Flag is not correct" };
    }
    // console.log(activatedLab);
    // // Optionally, clear the existing `actived_machine`
    // await this.userRepository.update(userId, {
    //   activate_lab: null,
    // });

    // // Find the lab to be removed
    // const lab = await this.activeLabRepository.findOne({
    //   where: { instanceOwner: owner },
    // });
    // console.log("Activated Lab Instance Lab:", activatedLab.instanceLab);

    // // Check if instanceLab is correctly set
    // if (!activatedLab.instanceLab) {
    //   return { msg: "Activated lab does not have an instanceLab" };
    // }

    // // Push the new `solved_machine` item
    // // owner.solved_machine.push(activatedLab.instanceLab);

    // // console.log("Updated Solved Machine Array:", owner.solved_machine);

    // // Save the updated `owner` entity
    // await this.userRepository.save(owner);

    // // Remove the `lab` from `activeLabRepository`
    // if (lab) {
    //   await this.activeLabRepository.remove(lab);
    // }
  }

  async getInstance(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    const instance = await this.activeLabRepository.findOne({
      where: { instanceOwner: user },
    });

    if (!instance) {
      throw new Error("User haven't create instance yet");
    }

    const { id: instanceId, instanceOwner, instanceLab, ip, port } = instance;

    return { id: instanceId, instanceOwner, instanceLab, ip, port };
  }
}
