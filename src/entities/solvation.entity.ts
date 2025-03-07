import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Student } from "./student.entity";
import { Lab } from "./lab.entity";

@Entity()
export class Solvation {
  @PrimaryColumn({ name: "student_id", type: "int" })
  studentId: number;

  @PrimaryColumn({ name: "lab_id", type: "int" })
  labId: number;

  @ManyToOne(() => Student, (student) => student.solvedLab, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "student_id" })
  student: Student;

  @ManyToOne(() => Lab, (lab) => lab.solvedBy, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "lab_id" })
  lab: Lab;

  @Column({ name: "solved_at", type: "timestamp" })
  solvedAt: Date;
}
