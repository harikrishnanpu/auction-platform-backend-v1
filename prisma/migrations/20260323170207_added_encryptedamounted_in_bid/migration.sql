-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "encryptedAmount" TEXT DEFAULT '',
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0;
