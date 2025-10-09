/*
  Warnings:

  - You are about to alter the column `startPrice` on the `Auction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `currentPrice` on the `Auction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `Bid` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Auction" ALTER COLUMN "startPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "currentPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Bid" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE INTEGER;
