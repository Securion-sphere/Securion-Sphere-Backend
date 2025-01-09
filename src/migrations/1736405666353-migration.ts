import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736405666353 implements MigrationInterface {
  name = "Migration1736405666353";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "learning_material" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "imageUrl" character varying, "fileName" character varying NOT NULL, "fileUrl" character varying NOT NULL, "fileType" character varying NOT NULL, CONSTRAINT "PK_cb0d73db1c8c283edcffcda8337" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "learning_material"`);
  }
}
