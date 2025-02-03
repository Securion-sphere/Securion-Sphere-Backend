import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1738564958785 implements MigrationInterface {
    name = 'Migration1738564958785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_image" DROP CONSTRAINT "UQ_483f878f574f836ee5a91de1dcf"`);
        await queryRunner.query(`ALTER TABLE "lab_image" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "lab_image" DROP CONSTRAINT "UQ_efad1703ba600a277eb3a074e6b"`);
        await queryRunner.query(`ALTER TABLE "lab_image" DROP COLUMN "image_id"`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD "image_name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD CONSTRAINT "UQ_8c6c57a385067c74c9e38ea711d" UNIQUE ("image_name")`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD "ownerId" integer`);
        await queryRunner.query(`ALTER TABLE "learning_material" ADD "category" character varying`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD CONSTRAINT "FK_47091800885da70253f861a3e9f" FOREIGN KEY ("ownerId") REFERENCES "supervisor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lab_image" DROP CONSTRAINT "FK_47091800885da70253f861a3e9f"`);
        await queryRunner.query(`ALTER TABLE "learning_material" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "lab_image" DROP COLUMN "ownerId"`);
        await queryRunner.query(`ALTER TABLE "lab_image" DROP CONSTRAINT "UQ_8c6c57a385067c74c9e38ea711d"`);
        await queryRunner.query(`ALTER TABLE "lab_image" DROP COLUMN "image_name"`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD "image_id" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD CONSTRAINT "UQ_efad1703ba600a277eb3a074e6b" UNIQUE ("image_id")`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD "name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "lab_image" ADD CONSTRAINT "UQ_483f878f574f836ee5a91de1dcf" UNIQUE ("name")`);
    }

}
