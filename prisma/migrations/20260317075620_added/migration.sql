/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `AuctionCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `AuctionCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AuctionCategory_name_key" ON "AuctionCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionCategory_slug_key" ON "AuctionCategory"("slug");
