/*
  Warnings:

  - Added the required column `submittedBy` to the `AuctionCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuctionCategory" ADD COLUMN     "submittedBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "AuctionCategory" ADD CONSTRAINT "AuctionCategory_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionCategory" ADD CONSTRAINT "AuctionCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AuctionCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
