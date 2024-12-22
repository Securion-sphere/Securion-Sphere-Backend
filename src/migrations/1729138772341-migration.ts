import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1729138772341 implements MigrationInterface {
    name = 'Migration1729138772341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student" DROP CONSTRAINT "FK_9316abc534487368cfd8527e8df"`);
        await queryRunner.query(`DROP INDEX "public"."FK_1"`);
        await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "solved_machine"`);
        await queryRunner.query(`ALTER TABLE "student" DROP CONSTRAINT "UQ_9316abc534487368cfd8527e8df"`);
        await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "studentId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "actived_machine"`);
        await queryRunner.query(`ALTER TABLE "student" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "student" ADD CONSTRAINT "UQ_b35463776b4a11a3df3c30d920a" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "active_lab_id" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_714b53409b52cf08d46d42e253c" UNIQUE ("active_lab_id")`);
        await queryRunner.query(`ALTER TABLE "supervisor" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supervisor" ADD CONSTRAINT "UQ_18dcf74321c9dfa80a7a5e82e2b" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "profile_img" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supervisor" ADD CONSTRAINT "FK_18dcf74321c9dfa80a7a5e82e2b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student" ADD CONSTRAINT "FK_b35463776b4a11a3df3c30d920a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_714b53409b52cf08d46d42e253c" FOREIGN KEY ("active_lab_id") REFERENCES "activated_lab"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_714b53409b52cf08d46d42e253c"`);
        await queryRunner.query(`ALTER TABLE "student" DROP CONSTRAINT "FK_b35463776b4a11a3df3c30d920a"`);
        await queryRunner.query(`ALTER TABLE "supervisor" DROP CONSTRAINT "FK_18dcf74321c9dfa80a7a5e82e2b"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "profile_img" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supervisor" DROP CONSTRAINT "UQ_18dcf74321c9dfa80a7a5e82e2b"`);
        await queryRunner.query(`ALTER TABLE "supervisor" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_714b53409b52cf08d46d42e253c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "active_lab_id"`);
        await queryRunner.query(`ALTER TABLE "student" DROP CONSTRAINT "UQ_b35463776b4a11a3df3c30d920a"`);
        await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "actived_machine" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "student" ADD "studentId" integer`);
        await queryRunner.query(`ALTER TABLE "student" ADD CONSTRAINT "UQ_9316abc534487368cfd8527e8df" UNIQUE ("studentId")`);
        await queryRunner.query(`ALTER TABLE "student" ADD "solved_machine" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "FK_1" ON "supervisor" ("userId") `);
        await queryRunner.query(`ALTER TABLE "student" ADD CONSTRAINT "FK_9316abc534487368cfd8527e8df" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
