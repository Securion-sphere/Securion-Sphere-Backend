import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Student } from "./student.entity";
import { Supervisor } from "./supervisor.entity";
import { ActivedLab } from "./actived-lab.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({
    name: "nick_name",
    type: "varchar",
    length: 30,
    nullable: true,
    unique: true,
  })
  nickName: string;

  @Column({ name: "profile_image", nullable: true })
  profileImg: string;

  @Column()
  email: string;

  @OneToOne(() => ActivedLab, (activedLab) => activedLab.instanceOwner)
  @JoinColumn({ name: "actived_lab_id" })
  activedLab: ActivedLab;

  @Column({ name: "ovpn_ip_address", nullable: true })
  ovpnIPAddress: string;

  @Column({ name: "hashed_refresh_token", nullable: true, unique: true })
  hashedRefreshToken: string;

  @OneToOne(() => Student, (student) => student.user)
  student: Student;

  @OneToOne(() => Supervisor, (supervisor) => supervisor.user)
  supervisor: Supervisor;
}
