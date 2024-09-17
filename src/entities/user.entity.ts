import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Student } from "./student.entity";
import { Supervisor } from "./supervisor.entity";
import { ActivatedLab } from "./actived-lab.entity";
import { Lab } from "./lab.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  nickName: string;

  @Column()
  profile_img: string;

  @Column()
  email: string;

  @OneToOne(() => ActivatedLab, (activatedLab) => activatedLab.instanceOwner)
  @JoinColumn()
  actived_machine: ActivatedLab;

  @ManyToMany(() => Lab)
  @JoinTable()
  solved_machine: Lab[];

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @OneToOne(() => Student, (student) => student.user)
  student: Student;

  @OneToOne(() => Supervisor, (supervisor) => supervisor.user)
  supervisor: Supervisor;
}
