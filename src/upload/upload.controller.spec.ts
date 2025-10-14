import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { ConfigService } from '@nestjs/config';

describe('UploadController', () => {
  let controller: UploadController;
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
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

    controller = module.get<UploadController>(UploadController);
    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned URL', async () => {
      const mockResult = {
        uploadUrl: 'https://test-bucket.s3.amazonaws.com/...',
        fileUrl: 'https://test-bucket.s3.amazonaws.com/...',
        key: 'uploads/test-key',
      };

      jest.spyOn(service, 'generatePresignedUrl').mockResolvedValue(mockResult);

      const result = await controller.generatePresignedUrl({
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
    });
  });
});
