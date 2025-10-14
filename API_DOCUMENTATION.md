# C2C Toy Auction E-commerce API Documentation

## Overview

This is a comprehensive REST API for a customer-to-customer toy auction e-commerce platform built with NestJS. The API supports user authentication, product management, auction creation, real-time bidding, order processing, and user profiles.

## Base URL

```
http://localhost:3001
```

## Authentication

The API uses `@thallesp/nestjs-better-auth` for authentication. Most endpoints require authentication via session cookies or JWT tokens.

### Authentication Headers

```http
Cookie: better-auth.session_token=<session_token>
```

## API Endpoints

### 1. Products API

#### Create Product

```http
POST /products
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Vintage LEGO Set",
  "description": "Complete vintage LEGO castle set from 1980s",
  "price": 15000,
  "imageUrl": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "status": "ACTIVE",
  "sellerId": "user_id_here"
}
```

**Response:**

```json
{
  "id": "product_id",
  "title": "Vintage LEGO Set",
  "description": "Complete vintage LEGO castle set from 1980s",
  "price": 15000,
  "imageUrl": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "status": "ACTIVE",
  "sellerId": "user_id_here",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "seller": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get All Products

```http
GET /products?skip=0&take=10&status=ACTIVE&sellerId=user_id
```

**Query Parameters:**

- `skip` (optional): Number of records to skip (pagination)
- `take` (optional): Number of records to take (pagination)
- `status` (optional): Filter by product status (ACTIVE, SOLD, INACTIVE)
- `sellerId` (optional): Filter by seller ID

**Response:**

```json
[
  {
    "id": "product_id",
    "title": "Vintage LEGO Set",
    "description": "Complete vintage LEGO castle set from 1980s",
    "price": 15000,
    "imageUrl": ["https://example.com/image1.jpg"],
    "status": "ACTIVE",
    "sellerId": "user_id_here",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "seller": {
      "id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "auction": null
  }
]
```

#### Get Product by ID

```http
GET /products/:id
```

**Response:**

```json
{
  "id": "product_id",
  "title": "Vintage LEGO Set",
  "description": "Complete vintage LEGO castle set from 1980s",
  "price": 15000,
  "imageUrl": ["https://example.com/image1.jpg"],
  "status": "ACTIVE",
  "sellerId": "user_id_here",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "seller": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "auction": {
    "id": "auction_id",
    "productId": "product_id",
    "startPrice": 10000,
    "currentPrice": 12000,
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-02T00:00:00.000Z",
    "isLive": true,
    "bids": [
      {
        "id": "bid_id",
        "amount": 12000,
        "userId": "bidder_id",
        "createdAt": "2024-01-01T12:00:00.000Z",
        "user": {
          "id": "bidder_id",
          "name": "Jane Smith"
        }
      }
    ]
  }
}
```

#### Update Product

```http
PATCH /products/:id
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Updated LEGO Set",
  "description": "Updated description",
  "price": 20000
}
```

#### Delete Product

```http
DELETE /products/:id
```

#### Get Products Count

```http
GET /products/count?status=ACTIVE&sellerId=user_id
```

### 2. Auctions API

#### Create Auction

```http
POST /auctions
Content-Type: application/json
```

**Request Body:**

```json
{
  "productId": "product_id",
  "startPrice": 10000,
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-01-02T00:00:00.000Z"
}
```

**Response:**

```json
{
  "id": "auction_id",
  "productId": "product_id",
  "startPrice": 10000,
  "currentPrice": 10000,
  "startTime": "2024-01-01T00:00:00.000Z",
  "endTime": "2024-01-02T00:00:00.000Z",
  "isLive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "product": {
    "id": "product_id",
    "title": "Vintage LEGO Set",
    "description": "Complete vintage LEGO castle set from 1980s",
    "price": 15000,
    "sellerId": "user_id_here"
  }
}
```

#### Get All Auctions

```http
GET /auctions?skip=0&take=10&isLive=true&search=LEGO
```

**Query Parameters:**

- `skip` (optional): Number of records to skip
- `take` (optional): Number of records to take
- `isLive` (optional): Filter by live status (true/false)
- `search` (optional): Search in product title/description

#### Get Auction by ID

```http
GET /auctions/:id
```

#### Update Auction

```http
PATCH /auctions/:id
Content-Type: application/json
```

**Request Body:**

```json
{
  "startPrice": 12000,
  "endTime": "2024-01-03T00:00:00.000Z"
}
```

#### End Auction Early

```http
POST /auctions/:id/end
```

#### Get Auctions Count

```http
GET /auctions/count?isLive=true
```

### 3. Bids API

#### Place Bid

```http
POST /bids
Content-Type: application/json
```

**Request Body:**

```json
{
  "auctionId": "auction_id",
  "amount": 15000
}
```

**Response:**

```json
{
  "id": "bid_id",
  "auctionId": "auction_id",
  "userId": "user_id",
  "amount": 15000,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "auction": {
    "id": "auction_id",
    "currentPrice": 15000,
    "product": {
      "title": "Vintage LEGO Set"
    }
  },
  "user": {
    "id": "user_id",
    "name": "Jane Smith"
  }
}
```

#### Get Auction Bids

```http
GET /bids/auction/:auctionId
```

**Response:**

```json
[
  {
    "id": "bid_id",
    "auctionId": "auction_id",
    "userId": "user_id",
    "amount": 15000,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "user": {
      "id": "user_id",
      "name": "Jane Smith"
    }
  }
]
```

#### Get User's Bids

```http
GET /bids/my-bids
```

### 4. Orders API

#### Get User's Orders

```http
GET /orders
```

**Response:**

```json
[
  {
    "id": "order_id",
    "productId": "product_id",
    "buyerId": "buyer_id",
    "sellerId": "seller_id",
    "amount": 15000,
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": "product_id",
      "title": "Vintage LEGO Set",
      "description": "Complete vintage LEGO castle set from 1980s"
    },
    "buyer": {
      "id": "buyer_id",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "seller": {
      "id": "seller_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

#### Get User's Sales

```http
GET /orders/sales
```

#### Get Order by ID

```http
GET /orders/:id
```

### 5. Users API

#### Get Current User

```http
GET /users/me
```

**Response:**

```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://example.com/avatar.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get User Profile

```http
GET /users/:id
```

#### Update User Profile

```http
PATCH /users/me
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Updated",
  "image": "https://example.com/new-avatar.jpg"
}
```

#### Get User Statistics

```http
GET /users/:id/stats
```

**Response:**

```json
{
  "productsListed": 5,
  "productsSold": 3,
  "totalBids": 12,
  "totalSales": 45000
}
```

### 6. Upload API

#### Upload Images

```http
POST /upload/images
Content-Type: multipart/form-data
```

**Form Data:**

- `images`: File array (1-10 files, max 5MB each)

**Supported file types:**

- image/jpeg
- image/jpg
- image/png
- image/gif
- image/webp

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "key": "uploads/1234567890-uuid-filename.jpg",
      "url": "https://bucket.s3.region.amazonaws.com/uploads/1234567890-uuid-filename.jpg"
    }
  ],
  "message": "Images uploaded successfully"
}
```

#### Get Presigned URL

```http
POST /upload/presigned-url
Content-Type: application/json
```

**Request Body:**

```json
{
  "fileName": "example.jpg",
  "fileType": "image/jpeg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://bucket.s3.region.amazonaws.com/...",
    "fileUrl": "https://bucket.s3.region.amazonaws.com/uploads/filename.jpg",
    "key": "uploads/filename.jpg"
  },
  "message": "Presigned URL generated successfully"
}
```

## WebSocket Events

### Connection

Connect to WebSocket at: `ws://localhost:3001`

### Events

#### Subscribe to Auction

```javascript
socket.emit('subscribe', { auctionId: 'auction_id' });
```

#### Unsubscribe from Auction

```javascript
socket.emit('unsubscribe', { auctionId: 'auction_id' });
```

#### New Bid (Server Event)

```javascript
socket.on('newBid', (data) => {
  console.log('New bid:', data);
  // data: { auctionId, bid, currentPrice }
});
```

#### Auction Ended (Server Event)

```javascript
socket.on('auctionEnded', (data) => {
  console.log('Auction ended:', data);
  // data: { auctionId, winner, finalPrice }
});
```

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "You can only update your own auctions",
  "error": "Forbidden"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Product with ID product_id not found",
  "error": "Not Found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "Bid amount must be higher than current price",
  "error": "Conflict"
}
```

## Data Models

### Product

```typescript
interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  imageUrl: string[];
  status: 'ACTIVE' | 'SOLD' | 'INACTIVE';
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  seller?: User;
  auction?: Auction;
}
```

### Auction

```typescript
interface Auction {
  id: string;
  productId: string;
  startPrice: number;
  currentPrice: number;
  startTime: Date;
  endTime: Date;
  isLive: boolean;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  bids?: Bid[];
}
```

### Bid

```typescript
interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  amount: number;
  createdAt: Date;
  auction?: Auction;
  user?: User;
}
```

### Order

```typescript
interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  buyer?: User;
  seller?: User;
}
```

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://admin:admin@localhost:5432/baobao"

# AWS S3
AWS_REGION="us-east-1"
S3_BUCKET_NAME="your-bucket-name"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"

# Server
PORT=3001
```

## Rate Limiting

- Image uploads: 10 files per request, 5MB per file
- Bid placement: No specific rate limit (handled by business logic)
- API requests: Standard HTTP rate limiting applies

## CORS Configuration

The API is configured to accept requests from:

- `http://localhost:3000` (Next.js frontend)
- `http://localhost:3001` (API server)

## Scheduled Tasks

- **Auction Endings**: Runs every minute to automatically end expired auctions
- **Order Creation**: Automatically creates orders when auctions end with winning bids

## Getting Started

1. Install dependencies: `pnpm install`
2. Set up environment variables
3. Run database migrations: `npx prisma migrate dev`
4. Start the server: `pnpm run start:dev`

## Testing

Run tests with:

```bash
pnpm run test
pnpm run test:e2e
```

## Support

For API support and questions, please refer to the source code or create an issue in the project repository.
