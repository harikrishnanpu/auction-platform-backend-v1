/*
  Warnings:

  - A unique constraint covering the columns `[auctionId]` on the table `PublicFallbackAuction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PublicFallbackAuction_auctionId_key" ON "PublicFallbackAuction"("auctionId");
