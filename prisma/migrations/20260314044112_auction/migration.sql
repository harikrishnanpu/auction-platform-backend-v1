/*
  Warnings:

  - A unique constraint covering the columns `[kycId,documentType,side]` on the table `KycDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuctionType" AS ENUM ('LONG', 'LIVE', 'SEALED');

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'ADDRESS_PROOF';

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "antiSnipSeconds" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "auctionType" "AuctionType" NOT NULL DEFAULT 'LONG',
ADD COLUMN     "bidCooldownSeconds" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "extensionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxExtensionCount" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "winnerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "KycDocument_kycId_documentType_side_key" ON "KycDocument"("kycId", "documentType", "side");

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
