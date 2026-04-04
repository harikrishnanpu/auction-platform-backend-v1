-- CreateEnum
CREATE TYPE "AuctionParticipantPaymentStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "AuctionParticipant" ADD COLUMN     "intialAmount" "AuctionParticipantPaymentStatus" NOT NULL DEFAULT 'PENDING';
