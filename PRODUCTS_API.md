# Products API Documentation

## Overview

This API provides full CRUD operations for managing products in the baobao application. Products can have auctions associated with them and are sold by users.

## Base URL

```
http://localhost:3000/products
```

## Endpoints

### 1. Create Product

**POST** `/products`

Creates a new product.

**Request Body:**

```json
{
  "title": "Product Title",
  "description": "Product description (optional)",
  "price": 9999,
  "imageUrl": "https://example.com/image.jpg (optional)",
  "status": "ACTIVE (optional, defaults to ACTIVE)",
  "sellerId": "user_cuid"
}
```

**Validation Rules:**

- `title`: Required, must be a non-empty string
- `description`: Optional string
- `price`: Required, must be a positive integer (in cents or smallest currency unit)
- `imageUrl`: Optional string
- `status`: Optional enum (`ACTIVE`, `SOLD`, `INACTIVE`)
- `sellerId`: Required, must be a valid user ID

**Response:**

```json
{
  "id": "product_cuid",
  "title": "Product Title",
  "description": "Product description",
  "price": 9999,
  "imageUrl": "https://example.com/image.jpg",
  "status": "ACTIVE",
  "createdAt": "2025-10-08T...",
  "updatedAt": "2025-10-08T...",
  "sellerId": "user_cuid",
  "seller": {
    "id": "user_cuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Get All Products

**GET** `/products`

Retrieves a list of products with optional filtering and pagination.

**Query Parameters:**

- `skip` (optional): Number of records to skip (for pagination)
- `take` (optional): Number of records to return (for pagination)
- `status` (optional): Filter by status (`ACTIVE`, `SOLD`, `INACTIVE`)
- `sellerId` (optional): Filter by seller ID

**Examples:**

```bash
# Get all products
GET /products

# Get first 10 products
GET /products?take=10

# Get next 10 products
GET /products?skip=10&take=10

# Get only active products
GET /products?status=ACTIVE

# Get products by specific seller
GET /products?sellerId=user_cuid123
```

**Response:**

```json
[
  {
    "id": "product_cuid",
    "title": "Product Title",
    "description": "Product description",
    "price": 9999,
    "imageUrl": "https://example.com/image.jpg",
    "status": "ACTIVE",
    "createdAt": "2025-10-08T...",
    "updatedAt": "2025-10-08T...",
    "sellerId": "user_cuid",
    "seller": {
      "id": "user_cuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "auction": null
  }
]
```

### 3. Count Products

**GET** `/products/count`

Returns the count of products matching the given filters.

**Query Parameters:**

- `status` (optional): Filter by status
- `sellerId` (optional): Filter by seller ID

**Examples:**

```bash
# Count all products
GET /products/count

# Count active products
GET /products/count?status=ACTIVE

# Count products by specific seller
GET /products/count?sellerId=user_cuid123
```

**Response:**

```json
42
```

### 4. Get Single Product

**GET** `/products/:id`

Retrieves a single product by ID with detailed information including auction and bids.

**Parameters:**

- `id`: Product ID (CUID)

**Example:**

```bash
GET /products/clxxx123456
```

**Response:**

```json
{
  "id": "product_cuid",
  "title": "Product Title",
  "description": "Product description",
  "price": 9999,
  "imageUrl": "https://example.com/image.jpg",
  "status": "ACTIVE",
  "createdAt": "2025-10-08T...",
  "updatedAt": "2025-10-08T...",
  "sellerId": "user_cuid",
  "seller": {
    "id": "user_cuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "auction": {
    "id": "auction_cuid",
    "startPrice": 5000,
    "currentPrice": 7500,
    "startTime": "2025-10-08T...",
    "endTime": "2025-10-15T...",
    "isLive": true,
    "bids": [
      {
        "id": "bid_cuid",
        "amount": 7500,
        "createdAt": "2025-10-08T...",
        "userId": "user_cuid2",
        "user": {
          "id": "user_cuid2",
          "name": "Jane Smith"
        }
      }
    ]
  }
}
```

**Error Response (404):**

```json
{
  "statusCode": 404,
  "message": "Product with ID clxxx123456 not found",
  "error": "Not Found"
}
```

### 5. Update Product

**PATCH** `/products/:id`

Updates an existing product. All fields are optional.

**Parameters:**

- `id`: Product ID (CUID)

**Request Body:**

```json
{
  "title": "Updated Title (optional)",
  "description": "Updated description (optional)",
  "price": 14999,
  "imageUrl": "https://example.com/new-image.jpg",
  "status": "SOLD"
}
```

**Response:**

```json
{
  "id": "product_cuid",
  "title": "Updated Title",
  "description": "Updated description",
  "price": 14999,
  "imageUrl": "https://example.com/new-image.jpg",
  "status": "SOLD",
  "createdAt": "2025-10-08T...",
  "updatedAt": "2025-10-08T...",
  "sellerId": "user_cuid",
  "seller": {
    "id": "user_cuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (404):**

```json
{
  "statusCode": 404,
  "message": "Product with ID clxxx123456 not found",
  "error": "Not Found"
}
```

### 6. Delete Product

**DELETE** `/products/:id`

Deletes a product by ID.

**Parameters:**

- `id`: Product ID (CUID)

**Example:**

```bash
DELETE /products/clxxx123456
```

**Response:**

```json
{
  "id": "product_cuid",
  "title": "Product Title",
  "description": "Product description",
  "price": 9999,
  "imageUrl": "https://example.com/image.jpg",
  "status": "ACTIVE",
  "createdAt": "2025-10-08T...",
  "updatedAt": "2025-10-08T...",
  "sellerId": "user_cuid"
}
```

**Error Response (404):**

```json
{
  "statusCode": 404,
  "message": "Product with ID clxxx123456 not found",
  "error": "Not Found"
}
```

## Product Status Enum

```typescript
enum ProductStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  INACTIVE = 'INACTIVE',
}
```

## Features

✅ **Full CRUD Operations**: Create, Read, Update, Delete
✅ **Validation**: Built-in DTO validation with class-validator
✅ **Error Handling**: Proper 404 responses for non-existent resources
✅ **Relationships**: Automatically includes seller information
✅ **Filtering**: Filter by status and seller
✅ **Pagination**: Skip and take parameters for pagination
✅ **Counting**: Get total count with filters
✅ **Detailed Views**: Single product view includes auction and bid information
✅ **Sorting**: Products sorted by creation date (newest first)

## Example Usage with cURL

```bash
# Create a product
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vintage Watch",
    "description": "Beautiful vintage watch from 1960s",
    "price": 29999,
    "sellerId": "clxxx123456"
  }'

# Get all active products
curl http://localhost:3000/products?status=ACTIVE

# Get products with pagination
curl http://localhost:3000/products?skip=0&take=10

# Get a single product
curl http://localhost:3000/products/clxxx123456

# Update a product
curl -X PATCH http://localhost:3000/products/clxxx123456 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 34999,
    "status": "SOLD"
  }'

# Delete a product
curl -X DELETE http://localhost:3000/products/clxxx123456

# Count products
curl http://localhost:3000/products/count?status=ACTIVE
```

## Database Schema

The Product model is based on the following Prisma schema:

```prisma
model Product {
  id          String        @id @default(cuid())
  title       String
  description String?
  price       Int
  imageUrl    String?
  status      ProductStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  sellerId String
  seller   User     @relation("UserProducts", fields: [sellerId], references: [id])
  auction  Auction?
  orders   Order[]
}
```

## Notes

- All IDs are CUIDs (Collision-resistant Unique IDs)
- Prices are stored as integers (recommended to use cents or smallest currency unit, e.g., 9999 = $99.99)
- Products are ordered by creation date (newest first)
- When fetching a single product, auction data includes bids sorted by amount (highest first)
- The `count` endpoint must come before the `:id` endpoint in the controller to avoid route conflicts
