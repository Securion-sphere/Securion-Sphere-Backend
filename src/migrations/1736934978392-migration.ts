import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736934978392 implements MigrationInterface {
    name = 'Migration1736934978392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab" RENAME COLUMN "isActive" TO "isReady"`);
        await queryRunner.query(`ALTER TABLE "learning_material" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "learning_material" DROP COLUMN "fileUrl"`);
        await queryRunner.query(`ALTER TABLE "learning_material" ADD "imageKey" character varying`);
        await queryRunner.query(`ALTER TABLE "learning_material" ADD "fileKey" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "learning_material" DROP COLUMN "fileKey"`);
        await queryRunner.query(`ALTER TABLE "learning_material" DROP COLUMN "imageKey"`);
        await queryRunner.query(`ALTER TABLE "learning_material" ADD "fileUrl" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "learning_material" ADD "imageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "lab" RENAME COLUMN "isReady" TO "isActive"`);
    }

}
