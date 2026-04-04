-- DropForeignKey
ALTER TABLE "PublicFallbackAuctionParticipants" DROP CONSTRAINT "PublicFallbackAuctionParticipants_publicFallbackAuctionId_fkey";

-- AddForeignKey
ALTER TABLE "PublicFallbackAuctionParticipants" ADD CONSTRAINT "PublicFallbackAuctionParticipants_publicFallbackAuctionId_fkey" FOREIGN KEY ("publicFallbackAuctionId") REFERENCES "PublicFallbackAuction"("auctionId") ON DELETE RESTRICT ON UPDATE CASCADE;
