-- CreateEnum
CREATE TYPE "AuctionCategoryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "AuctionCategory" ADD COLUMN     "status" "AuctionCategoryStatus" NOT NULL DEFAULT 'PENDING';
