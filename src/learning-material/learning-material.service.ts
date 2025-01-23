import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { ConfigType } from "@nestjs/config";
import { Readable } from "stream";
import { LearningMaterial } from "src/entities/learning-material.entity";
import { CreateLearningMaterialDto } from "./dto/create-learning-material.dto";
import { UpdateLearningMaterialDto } from "./dto/update-learning-material.dto";
import minioConfig from "src/config/minio.config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as path from "path";

@Injectable()
export class LearningMaterialService {
  constructor(
    @InjectRepository(LearningMaterial)
    private learningMaterialRepository: Repository<LearningMaterial>,
    @Inject(minioConfig.KEY)
    private MinioConfig: ConfigType<typeof minioConfig>,
    private readonly client: S3Client,
  ) {}

  async create(
    createLearningMaterialDto: CreateLearningMaterialDto,
    files: {
      image?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
  ) {
    const { title, description } = createLearningMaterialDto;
    const mainFile = files.file?.[0];
    const imageFile = files.image?.[0];

    if (!mainFile) {
      throw new Error("Main file is required");
    }

    // Determine file type and set appropriate base path
    const isMarkdown =
      mainFile.mimetype.includes("markdown") ||
      mainFile.originalname.toLowerCase().endsWith(".md");
    const basePath = isMarkdown
      ? `learning-material/md/${Date.now()}-${path.parse(mainFile.originalname).name}/`
      : `learning-material/pdf/${Date.now()}-${path.parse(mainFile.originalname).name}/`;

    // Upload main file
    const fileKey = `${basePath}${mainFile.originalname}`;
    await this.uploadToMinio(fileKey, mainFile);

    // Upload image if provided
    let imageKey = null;
    if (imageFile) {
      imageKey = `${basePath}background-image${path.extname(imageFile.originalname)}`;
      await this.uploadToMinio(imageKey, imageFile);
    }

    const learningMaterial = this.learningMaterialRepository.create({
      title,
      description,
      fileName: mainFile.originalname,
      fileKey, // Store only the file key
      fileType: isMarkdown ? "md" : "pdf",
      imageKey, // Store only the image key
    });

    return this.learningMaterialRepository.save(learningMaterial);
  }

  async update(
    id: number,
    updateLearningMaterialDto: UpdateLearningMaterialDto,
    files: {
      image?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
  ) {
    const material = await this.findOne(id);
    const { title, description } = updateLearningMaterialDto;
    const mainFile = files.file?.[0];
    const imageFile = files.image?.[0];

    // Update basic info
    if (title) material.title = title;
    if (description) material.description = description;

    // Update main file if provided
    if (mainFile) {
      // Delete old file
      if (material.fileKey) {
        await this.deleteFromMinio(material.fileKey);
      }

      // Determine file type and set appropriate base path
      const isMarkdown =
        mainFile.mimetype.includes("markdown") ||
        mainFile.originalname.toLowerCase().endsWith(".md");
      const basePath = isMarkdown
        ? `learning-material/md/${Date.now()}-${path.parse(mainFile.originalname).name}/`
        : `learning-material/pdf/${Date.now()}-${path.parse(mainFile.originalname).name}/`;

      // Upload new file
      const fileKey = `${basePath}${mainFile.originalname}`;
      await this.uploadToMinio(fileKey, mainFile);

      material.fileName = mainFile.originalname;
      material.fileKey = fileKey; // Update file key
      material.fileType = isMarkdown ? "md" : "pdf";
    }

    // Update image if provided
    if (imageFile) {
      // Delete old image
      if (material.imageKey) {
        await this.deleteFromMinio(material.imageKey);
      }

      // Extract basePath from the existing fileKey
      const basePath = material.fileKey
        ? material.fileKey.substring(0, material.fileKey.lastIndexOf("/") + 1)
        : `learning-material/${material.fileType}/${Date.now()}-${path.parse(material.fileName).name}/`;

      // Upload new image using the same basePath
      const imageKey = `${basePath}background-image${path.extname(imageFile.originalname)}`;
      await this.uploadToMinio(imageKey, imageFile);

      material.imageKey = imageKey; // Update image key
    }

    return this.learningMaterialRepository.save(material);
  }

  private async generatePresignedUrl(
    key: string,
    expiresIn = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.MinioConfig.bucket,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.client, command, { expiresIn });
      return url;
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      throw new Error("Failed to generate file URL");
    }
  }

  async findAll() {
    const materials = await this.learningMaterialRepository.find();

    const materialsWithUrls = await Promise.all(
      materials.map(async (material) => {
        const [fileUrl, imageUrl] = await Promise.all([
          this.generatePresignedUrl(material.fileKey), // Use fileKey
          material.imageKey
            ? this.generatePresignedUrl(material.imageKey)
            : null, // Use imageKey
        ]);

        return {
          ...material,
          filePresignedUrl: fileUrl,
          imagePresignedUrl: imageUrl,
        };
      }),
    );

    return materialsWithUrls;
  }

  async findOne(id: number) {
    const material = await this.learningMaterialRepository.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException(`Learning material #${id} not found`);
    }

    const [fileUrl, imageUrl] = await Promise.all([
      this.generatePresignedUrl(material.fileKey), // Use fileKey
      material.imageKey ? this.generatePresignedUrl(material.imageKey) : null, // Use imageKey
    ]);

    return {
      ...material,
      filePresignedUrl: fileUrl,
      imagePresignedUrl: imageUrl,
    };
  }

  async remove(id: number) {
    const material = await this.findOne(id);

    // Delete files from MinIO
    if (material.fileKey) {
      await this.deleteFromMinio(material.fileKey);
    }
    if (material.imageKey) {
      await this.deleteFromMinio(material.imageKey);
    }

    return this.learningMaterialRepository.remove(material);
  }

  private async uploadToMinio(key: string, file: Express.Multer.File) {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.MinioConfig.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (error) {
      console.error("Error uploading to MinIO:", error);
      throw new Error("Failed to upload file");
    }
  }

  private async deleteFromMinio(key: string) {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.MinioConfig.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.error("Error deleting from MinIO:", error);
      // We might want to continue even if delete fails
    }
  }

  async getFile(id: number) {
    try {
      const material = await this.learningMaterialRepository.findOne({
        where: { id },
      });

      if (!material) {
        throw new NotFoundException(`Learning material #${id} not found`);
      }

      // Use the fileKey stored in the material entity
      const key = material.fileKey;

      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.MinioConfig.bucket,
          Key: key,
        }),
      );
      return (response.Body as Readable) ?? null;
    } catch (err) {
      console.error(`Error getting file for material ${id}:`, err);
      throw err;
    }
  }
}
