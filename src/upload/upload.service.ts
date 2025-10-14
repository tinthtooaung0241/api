import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  // Allowed image types
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  // Max file size: 5MB
  private readonly maxFileSize = 5 * 1024 * 1024;

  constructor(private readonly configService: ConfigService) {
    this.region =
      this.configService.get<string>('upload.AWS_REGION') || 'us-east-1';
    this.bucketName =
      this.configService.get<string>('upload.S3_BUCKET_NAME') || 'my-bucket';

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId:
          this.configService.get<string>('upload.AWS_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('upload.AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Validate image file
   */
  validateImage(file: Express.Multer.File): void {
    // Check file type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds limit. Maximum size: ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }
  }

  /**
   * Generate presigned URL for client-side upload
   */
  async generatePresignedUrl(
    fileName: string,
    fileType: string,
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    // Validate file type
    if (!this.allowedMimeTypes.includes(fileType)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Generate unique key with sanitized filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${Date.now()}-${uuidv4()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    // Generate presigned URL that expires in 5 minutes
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 300,
    });

    // The public URL where file will be accessible
    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
  }

  /**
   * Direct upload to S3 (server-side)
   */
  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ fileUrl: string; key: string }> {
    // Validate the image
    this.validateImage(file);

    // Generate unique key with sanitized filename
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `uploads/${Date.now()}-${uuidv4()}-${sanitizedFileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Optional: Set cache control
      CacheControl: 'max-age=31536000',
    });

    await this.s3Client.send(command);

    const fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    return { fileUrl, key };
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
  ): Promise<Array<{ fileUrl: string; key: string }>> {
    const uploadPromises = files.map((file) => {
      this.validateImage(file);
      return this.uploadFile(file);
    });
    return Promise.all(uploadPromises);
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Delete multiple files from S3
   */
  async deleteMultipleFiles(keys: string[]): Promise<void> {
    const deletePromises = keys.map((key) => this.deleteFile(key));
    await Promise.all(deletePromises);
  }

  /**
   * Extract key from S3 URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Remove leading slash
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    } catch {
      return null;
    }
  }
}
