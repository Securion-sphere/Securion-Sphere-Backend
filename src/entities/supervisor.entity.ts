import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Lab } from "./lab.entity";
import { LabImage } from "./lab-image.entity";

@Entity()
export class Supervisor {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Lab, (lab) => lab.creator)
  labs: Lab[];

  @OneToMany(() => LabImage, (labImage) => labImage.owner)
  imageLabs: LabImage[];
}
