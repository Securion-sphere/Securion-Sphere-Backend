import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Student } from "./student.entity";
import { Supervisor } from "./supervisor.entity";
import { ActivatedLab } from "./actived-lab.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  nickName: string;

  @Column({ nullable: true })
  profile_img: string;

  @Column()
  email: string;

  @OneToOne(() => ActivatedLab, (activatedLab) => activatedLab.instanceOwner)
  @JoinColumn({ name: "active_lab_id" })
  activate_lab: ActivatedLab;

  @Column({ nullable: true })
  hashedRefreshToken: string;

  @OneToOne(() => Student, (student) => student.user)
  student: Student;

  @OneToOne(() => Supervisor, (supervisor) => supervisor.user)
  supervisor: Supervisor;
}
