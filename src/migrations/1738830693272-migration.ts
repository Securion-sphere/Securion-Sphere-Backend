import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1738830693272 implements MigrationInterface {
  name = "Migration1738830693272";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lab_image" DROP CONSTRAINT "FK_47091800885da70253f861a3e9f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_image" RENAME COLUMN "ownerId" TO "image_id"`,
    );
    await queryRunner.query(`ALTER TABLE "lab_image" DROP COLUMN "image_id"`);
    await queryRunner.query(
      `ALTER TABLE "lab_image" ADD "image_id" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_image" ADD CONSTRAINT "UQ_efad1703ba600a277eb3a074e6b" UNIQUE ("image_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lab_image" DROP CONSTRAINT "UQ_efad1703ba600a277eb3a074e6b"`,
    );
    await queryRunner.query(`ALTER TABLE "lab_image" DROP COLUMN "image_id"`);
    await queryRunner.query(`ALTER TABLE "lab_image" ADD "image_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "lab_image" RENAME COLUMN "image_id" TO "ownerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lab_image" ADD CONSTRAINT "FK_47091800885da70253f861a3e9f" FOREIGN KEY ("ownerId") REFERENCES "supervisor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
