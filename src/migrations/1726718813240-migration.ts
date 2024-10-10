import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1726718813240 implements MigrationInterface {
    name = 'Migration1726718813240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solvation" DROP CONSTRAINT "FK_391f16032999d13b64cf1ef8fe6"`);
        await queryRunner.query(`ALTER TABLE "solvation" DROP CONSTRAINT "FK_c7f73f974b576f43f198350cb6c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_391f16032999d13b64cf1ef8fe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7f73f974b576f43f198350cb6"`);
        await queryRunner.query(`ALTER TABLE "solvation" ADD "dateSolved" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "solvation" ADD CONSTRAINT "FK_391f16032999d13b64cf1ef8fe6" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "solvation" ADD CONSTRAINT "FK_c7f73f974b576f43f198350cb6c" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "solvation" DROP CONSTRAINT "FK_c7f73f974b576f43f198350cb6c"`);
        await queryRunner.query(`ALTER TABLE "solvation" DROP CONSTRAINT "FK_391f16032999d13b64cf1ef8fe6"`);
        await queryRunner.query(`ALTER TABLE "solvation" DROP COLUMN "dateSolved"`);
        await queryRunner.query(`CREATE INDEX "IDX_c7f73f974b576f43f198350cb6" ON "solvation" ("labId") `);
        await queryRunner.query(`CREATE INDEX "IDX_391f16032999d13b64cf1ef8fe" ON "solvation" ("studentId") `);
        await queryRunner.query(`ALTER TABLE "solvation" ADD CONSTRAINT "FK_c7f73f974b576f43f198350cb6c" FOREIGN KEY ("labId") REFERENCES "lab"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "solvation" ADD CONSTRAINT "FK_391f16032999d13b64cf1ef8fe6" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
