-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "bannedReason" TEXT,
ADD COLUMN     "role" TEXT DEFAULT 'user';

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;
