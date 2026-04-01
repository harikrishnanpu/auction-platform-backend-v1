-- CreateEnum
CREATE TYPE "AuctionWinnerStatus" AS ENUM ('PENDING', 'PARTIAL_PAYMENT_PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "AuctionWinner" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "status" "AuctionWinnerStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionWinner_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuctionWinner" ADD CONSTRAINT "AuctionWinner_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionWinner" ADD CONSTRAINT "AuctionWinner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
