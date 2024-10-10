import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1728372831580 implements MigrationInterface {
    name = 'Migration1728372831580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activated_lab" ADD "containerId" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "activated_lab" DROP COLUMN "containerId"`);
    }

}
