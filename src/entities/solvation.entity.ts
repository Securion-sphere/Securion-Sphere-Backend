import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Student } from "./student.entity";
import { Lab } from "./lab.entity";

@Entity()
export class Solvation {
  @PrimaryColumn()
  studentId: number;

  @PrimaryColumn()
  labId: number;

  @ManyToOne(() => Student, (student) => student.solved_lab)
  student: Student;

  @ManyToOne(() => Lab, (lab) => lab.solved_by)
  lab: Lab;

  @Column()
  dateSolved: Date;
}
