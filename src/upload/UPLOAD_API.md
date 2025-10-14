# Image Upload API Documentation

Complete image upload feature with S3 integration supporting both client-side and server-side uploads.

## Features

- ✅ Server-side image upload
- ✅ Client-side presigned URL generation
- ✅ Multiple image uploads
- ✅ Image validation (type and size)
- ✅ File deletion
- ✅ Supported formats: JPEG, JPG, PNG, GIF, WebP
- ✅ Maximum file size: 5MB

## Environment Variables

Add these to your `.env` file:

```env
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

## API Endpoints

### 1. Generate Presigned URL (Client-Side Upload)

Generate a presigned URL for direct client-to-S3 upload.

**Endpoint:** `POST /upload/presigned-url`

**Request Body:**

```json
{
  "fileName": "profile-photo.jpg",
  "fileType": "image/jpeg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://your-bucket.s3.amazonaws.com/uploads/...",
    "fileUrl": "https://your-bucket.s3.amazonaws.com/uploads/...",
    "key": "uploads/1234567890-uuid-profile-photo.jpg"
  },
  "message": "Presigned URL generated successfully"
}
```

**Client-Side Usage:**

```javascript
// 1. Get presigned URL from your API
const response = await fetch('/upload/presigned-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileName: file.name,
    fileType: file.type,
  }),
});
const { data } = await response.json();

// 2. Upload directly to S3
await fetch(data.uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
});

// 3. Use fileUrl to access the uploaded image
console.log('Image URL:', data.fileUrl);
```

---

### 2. Upload Single Image (Server-Side)

Upload an image through your server.

**Endpoint:** `POST /upload/image`

**Request:** `multipart/form-data`

- Field name: `file`

**cURL Example:**

```bash
curl -X POST http://localhost:3000/upload/image \
  -F "file=@/path/to/image.jpg"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fileUrl": "https://your-bucket.s3.amazonaws.com/uploads/...",
    "key": "uploads/1234567890-uuid-image.jpg"
  },
  "message": "Image uploaded successfully"
}
```

**JavaScript/Fetch Example:**

```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/upload/image', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Uploaded:', result.data.fileUrl);
```

**React Example:**

```jsx
const handleUpload = async (e) => {
  const file = e.target.files[0];

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/upload/image', {
    method: 'POST',
    body: formData,
  });

  const { data } = await response.json();
  setImageUrl(data.fileUrl);
};

return <input type="file" onChange={handleUpload} accept="image/*" />;
```

---

### 3. Upload Multiple Images

Upload multiple images at once (max 10 files).

**Endpoint:** `POST /upload/images`

**Request:** `multipart/form-data`

- Field name: `files` (array)

**cURL Example:**

```bash
curl -X POST http://localhost:3000/upload/images \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg"
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "fileUrl": "https://your-bucket.s3.amazonaws.com/uploads/...",
      "key": "uploads/1234567890-uuid-image1.jpg"
    },
    {
      "fileUrl": "https://your-bucket.s3.amazonaws.com/uploads/...",
      "key": "uploads/1234567890-uuid-image2.jpg"
    }
  ],
  "message": "2 image(s) uploaded successfully"
}
```

**JavaScript Example:**

```javascript
const formData = new FormData();
files.forEach((file) => {
  formData.append('files', file);
});

const response = await fetch('/upload/images', {
  method: 'POST',
  body: formData,
});

const { data } = await response.json();
data.forEach((file) => console.log(file.fileUrl));
```

---

### 4. Delete Single File

Delete a file from S3 using its key.

**Endpoint:** `DELETE /upload/file`

**Request Body:**

```json
{
  "key": "uploads/1234567890-uuid-image.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

### 5. Delete Multiple Files

Delete multiple files at once.

**Endpoint:** `DELETE /upload/files`

**Request Body:**

```json
{
  "keys": [
    "uploads/1234567890-uuid-image1.jpg",
    "uploads/1234567890-uuid-image2.jpg",
    "uploads/1234567890-uuid-image3.jpg"
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "3 file(s) deleted successfully"
}
```

---

### 6. Delete File by URL

Delete a file using its S3 URL instead of key.

**Endpoint:** `DELETE /upload/file-by-url`

**Request Body:**

```json
{
  "url": "https://your-bucket.s3.amazonaws.com/uploads/1234567890-uuid-image.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

---

## Validation Rules

### Allowed File Types

- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`

### File Size Limit

- Maximum: **5MB** per file

### Multiple Upload Limits

- Maximum: **10 files** per request

---

## Error Responses

### Invalid File Type

```json
{
  "statusCode": 400,
  "message": "Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp",
  "error": "Bad Request"
}
```

### File Too Large

```json
{
  "statusCode": 400,
  "message": "File size exceeds limit. Maximum size: 5MB",
  "error": "Bad Request"
}
```

### No File Provided

```json
{
  "statusCode": 400,
  "message": "No file provided",
  "error": "Bad Request"
}
```

---

## Integration Examples

### Using with Product Images

```typescript
// products.service.ts
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private uploadService: UploadService,
    private prisma: PrismaService,
  ) {}

  async createProduct(dto: CreateProductDto, imageFile: Express.Multer.File) {
    // Upload image
    const { fileUrl, key } = await this.uploadService.uploadFile(imageFile);

    // Create product with image URL
    const product = await this.prisma.product.create({
      data: {
        ...dto,
        imageUrl: fileUrl,
        imageKey: key,
      },
    });

    return product;
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });

    // Delete image from S3
    if (product.imageKey) {
      await this.uploadService.deleteFile(product.imageKey);
    }

    // Delete product
    await this.prisma.product.delete({ where: { id } });
  }
}
```

### React Hook for Image Upload

```typescript
// useImageUpload.ts
import { useState } from 'react';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/upload/image', {
        method: 'POST',
        body: formData,
      });

      const { data } = await response.json();
      setImageUrl(data.fileUrl);

      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, imageUrl };
};
```

---

## S3 Bucket Configuration

### CORS Configuration

Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Bucket Policy (Public Read)

If you want images to be publicly accessible:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/uploads/*"
    }
  ]
}
```

---

## Testing

### Using Postman

1. **Upload Image:**
   - Method: POST
   - URL: `http://localhost:3000/upload/image`
   - Body: form-data
   - Key: `file` (type: File)
   - Value: Select your image file

2. **Generate Presigned URL:**
   - Method: POST
   - URL: `http://localhost:3000/upload/presigned-url`
   - Body: raw (JSON)
   ```json
   {
     "fileName": "test.jpg",
     "fileType": "image/jpeg"
   }
   ```

### Using cURL

```bash
# Upload image
curl -X POST http://localhost:3000/upload/image \
  -F "file=@./test-image.jpg"

# Generate presigned URL
curl -X POST http://localhost:3000/upload/presigned-url \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","fileType":"image/jpeg"}'

# Delete file
curl -X DELETE http://localhost:3000/upload/file \
  -H "Content-Type: application/json" \
  -d '{"key":"uploads/1234567890-uuid-test.jpg"}'
```

---

## Best Practices

1. **Store Keys in Database:** Always store the S3 key with your records for easy deletion
2. **Handle Errors:** Wrap upload operations in try-catch blocks
3. **Validate Client-Side:** Pre-validate files on the client before upload
4. **Use Presigned URLs:** For better performance, use presigned URLs for client-side uploads
5. **Clean Up:** Delete old images when updating or deleting records
6. **Optimize Images:** Consider compressing images before upload
7. **Set Expiration:** Configure S3 lifecycle rules to auto-delete old files if needed

---

## Security Considerations

1. **Authentication:** Add authentication guards to protect upload endpoints
2. **Rate Limiting:** Implement rate limiting to prevent abuse
3. **File Validation:** Always validate file types and sizes on the server
4. **Private Buckets:** Keep buckets private and use presigned URLs for access
5. **API Keys:** Never expose AWS credentials in client-side code
