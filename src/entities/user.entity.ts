import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './student.entity';
import { Supervisor } from './supervisor.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  nickName: string;

  @Column()
  profile_img: string;

  @Column()
  googleId: string;

  @Column()
  email: string;

  @Column({ default: 0 })
  actived_machine: number;

  @OneToOne(() => Student, (student) => student.user)
  student: Student;

  @OneToOne(() => Supervisor, (supervisor) => supervisor.user)
  supervisor: Supervisor;
}
