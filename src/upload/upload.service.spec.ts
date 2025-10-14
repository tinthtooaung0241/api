import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'upload.AWS_REGION': 'us-east-1',
                'upload.S3_BUCKET_NAME': 'test-bucket',
                'upload.AWS_ACCESS_KEY_ID': 'test-key',
                'upload.AWS_SECRET_ACCESS_KEY': 'test-secret',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateImage', () => {
    it('should throw error for invalid file type', () => {
      const mockFile = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      expect(() => service.validateImage(mockFile)).toThrow(
        BadRequestException,
      );
    });

    it('should throw error for file size exceeding limit', () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
      } as Express.Multer.File;

      expect(() => service.validateImage(mockFile)).toThrow(
        BadRequestException,
      );
    });

    it('should pass validation for valid image', () => {
      const mockFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      expect(() => service.validateImage(mockFile)).not.toThrow();
    });
  });

  describe('extractKeyFromUrl', () => {
    it('should extract key from S3 URL', () => {
      const url = 'https://test-bucket.s3.amazonaws.com/uploads/test-file.jpg';
      const key = service.extractKeyFromUrl(url);
      expect(key).toBe('uploads/test-file.jpg');
    });

    it('should return null for invalid URL', () => {
      const key = service.extractKeyFromUrl('invalid-url');
      expect(key).toBeNull();
    });
  });
});
