-- CreateEnum
CREATE TYPE "AuctionPublicFallbackStatus" AS ENUM ('ACCEPTED', 'REJECTED', 'PENDING');

-- CreateEnum
CREATE TYPE "AuctionPublicFallbackPaymentStatus" AS ENUM ('PAID', 'PENDING');

-- CreateTable
CREATE TABLE "PublicFallbackAuction" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "AuctionPublicFallbackStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "AuctionPublicFallbackPaymentStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "PublicFallbackAuction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicFallbackAuctionParticipants" (
    "id" TEXT NOT NULL,
    "publicFallbackAuctionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AuctionPublicFallbackStatus" NOT NULL,
    "paymentStatus" "AuctionPublicFallbackPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicFallbackAuctionParticipants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicFallbackAuctionParticipants_publicFallbackAuctionId_u_key" ON "PublicFallbackAuctionParticipants"("publicFallbackAuctionId", "userId");

-- AddForeignKey
ALTER TABLE "PublicFallbackAuction" ADD CONSTRAINT "PublicFallbackAuction_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicFallbackAuctionParticipants" ADD CONSTRAINT "PublicFallbackAuctionParticipants_publicFallbackAuctionId_fkey" FOREIGN KEY ("publicFallbackAuctionId") REFERENCES "PublicFallbackAuction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicFallbackAuctionParticipants" ADD CONSTRAINT "PublicFallbackAuctionParticipants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
