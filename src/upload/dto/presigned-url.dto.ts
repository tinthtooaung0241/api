import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class GeneratePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(
    [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    {
      message:
        'File type must be one of: image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml',
    },
  )
  fileType!: string;
}
