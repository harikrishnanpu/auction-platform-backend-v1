-- CreateEnum
CREATE TYPE "BidStrategy" AS ENUM ('SIMPLE', 'FASTER', 'SMARTER', 'SNIPPER');

-- DropIndex
DROP INDEX "UserSubscription_userId_status_key";

-- CreateTable
CREATE TABLE "AutoBidConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "maxBidAmount" DOUBLE PRECISION NOT NULL,
    "biddingStrategy" "BidStrategy" NOT NULL DEFAULT 'SIMPLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutoBidConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutoBidConfig_userId_auctionId_key" ON "AutoBidConfig"("userId", "auctionId");

-- AddForeignKey
ALTER TABLE "AutoBidConfig" ADD CONSTRAINT "AutoBidConfig_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutoBidConfig" ADD CONSTRAINT "AutoBidConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
