/*
  Warnings:

  - A unique constraint covering the columns `[auctionNumber]` on the table `Auction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auctionNumber` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "auctionNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Auction_auctionNumber_key" ON "Auction"("auctionNumber");
