# Upload Module

Complete image upload feature with AWS S3 integration for NestJS.

## Features

- ✅ Client-side upload with presigned URLs
- ✅ Server-side direct upload
- ✅ Multiple file upload support
- ✅ File validation (type & size)
- ✅ File deletion support
- ✅ TypeScript strict mode compatible
- ✅ Comprehensive test coverage

## Quick Start

### 1. Environment Setup

Add these variables to your `.env` file:

```env
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### 2. Module is Already Registered

The `UploadModule` is already registered in `app.module.ts`.

### 3. Use in Your Services

```typescript
import { UploadService } from './upload/upload.service';

@Injectable()
export class YourService {
  constructor(private uploadService: UploadService) {}

  async handleFileUpload(file: Express.Multer.File) {
    const { fileUrl, key } = await this.uploadService.uploadFile(file);
    return fileUrl;
  }
}
```

## API Endpoints

All endpoints are prefixed with `/upload`:

| Method | Endpoint                | Description                                   |
| ------ | ----------------------- | --------------------------------------------- |
| POST   | `/upload/presigned-url` | Generate presigned URL for client-side upload |
| POST   | `/upload/image`         | Upload single image (server-side)             |
| POST   | `/upload/images`        | Upload multiple images (max 10)               |
| DELETE | `/upload/file`          | Delete file by key                            |
| DELETE | `/upload/files`         | Delete multiple files                         |
| DELETE | `/upload/file-by-url`   | Delete file by S3 URL                         |

## File Validation

- **Allowed types:** JPEG, JPG, PNG, GIF, WebP
- **Max file size:** 5MB per file
- **Max files (multiple upload):** 10 files

## Documentation

See [UPLOAD_API.md](./UPLOAD_API.md) for complete API documentation with examples.

## Testing

Run tests:

```bash
npm run test
```

## S3 Setup

1. Create an S3 bucket
2. Configure CORS (see [UPLOAD_API.md](./UPLOAD_API.md#s3-bucket-configuration))
3. Set bucket policy for public read access
4. Add credentials to `.env`

## Files Structure

```
src/upload/
├── dto/
│   ├── presigned-url.dto.ts    # DTO for presigned URL generation
│   ├── delete-file.dto.ts      # DTOs for file deletion
│   └── index.ts                # Barrel export
├── upload.controller.ts        # API endpoints
├── upload.service.ts           # Core upload logic
├── upload.module.ts            # Module definition
├── upload.controller.spec.ts  # Controller tests
├── upload.service.spec.ts     # Service tests
├── UPLOAD_API.md              # Complete API documentation
└── README.md                  # This file
```

## Usage Examples

### Client-Side Upload with Presigned URL

```typescript
// Frontend code
const file = e.target.files[0];

// Step 1: Get presigned URL
const { data } = await fetch('/upload/presigned-url', {
  method: 'POST',
  body: JSON.stringify({
    fileName: file.name,
    fileType: file.type,
  }),
}).then((r) => r.json());

// Step 2: Upload directly to S3
await fetch(data.uploadUrl, {
  method: 'PUT',
  body: file,
});

// Step 3: Use the file URL
console.log('Image uploaded:', data.fileUrl);
```

### Server-Side Upload

```typescript
// Using multer
@Post('product')
@UseInterceptors(FileInterceptor('image'))
async createProduct(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: CreateProductDto
) {
  const { fileUrl } = await this.uploadService.uploadFile(file);
  return this.productsService.create({ ...dto, imageUrl: fileUrl });
}
```

## License

Part of the BaoBao API project.
