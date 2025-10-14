import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import {
  GeneratePresignedUrlDto,
  DeleteFileDto,
  DeleteMultipleFilesDto,
} from './dto';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@AllowAnonymous()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Generate presigned URL for client-side upload
   * POST /upload/presigned-url
   */
  @Post('presigned-url')
  async generatePresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    const result = await this.uploadService.generatePresignedUrl(
      dto.fileName,
      dto.fileType,
    );

    return {
      success: true,
      data: result,
      message: 'Presigned URL generated successfully',
    };
  }

  /**
   * Upload one or multiple images (server-side)
   * POST /upload/images
   * Accepts 1-10 images with field name 'images'
   */
  @Post('images')
  @UseInterceptors(FilesInterceptor('images', 10)) // Max 10 files
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    if (files.length > 10) {
      throw new BadRequestException('Maximum 10 files allowed');
    }

    const results = await this.uploadService.uploadMultipleImages(files);

    return {
      success: true,
      data: results,
      message: `${results.length} image(s) uploaded successfully`,
    };
  }

  /**
   * Delete a single file
   * DELETE /upload/file
   */
  @Delete('file')
  async deleteFile(@Body() dto: DeleteFileDto) {
    await this.uploadService.deleteFile(dto.key);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  /**
   * Delete multiple files
   * DELETE /upload/files
   */
  @Delete('files')
  async deleteMultipleFiles(@Body() dto: DeleteMultipleFilesDto) {
    await this.uploadService.deleteMultipleFiles(dto.keys);

    return {
      success: true,
      message: `${dto.keys.length} file(s) deleted successfully`,
    };
  }

  /**
   * Delete file by URL
   * DELETE /upload/file-by-url
   */
  @Delete('file-by-url')
  async deleteFileByUrl(@Body() body: { url: string }) {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }

    const key = this.uploadService.extractKeyFromUrl(body.url);

    if (!key) {
      throw new BadRequestException('Invalid S3 URL');
    }

    await this.uploadService.deleteFile(key);

    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}
