import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726729138801 implements MigrationInterface {
  name = "Migration1726729138801";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "profile_img" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "profile_img" SET NOT NULL`,
    );
  }
}
