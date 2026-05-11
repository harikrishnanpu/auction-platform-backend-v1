/*
  Warnings:

  - The values [SIMPLE,SMARTER,SNIPPER] on the enum `BidStrategy` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BidStrategy_new" AS ENUM ('SLOW', 'FASTER', 'SNIPER');
ALTER TABLE "public"."AutoBidConfig" ALTER COLUMN "biddingStrategy" DROP DEFAULT;
ALTER TABLE "AutoBidConfig" ALTER COLUMN "biddingStrategy" TYPE "BidStrategy_new" USING ("biddingStrategy"::text::"BidStrategy_new");
ALTER TYPE "BidStrategy" RENAME TO "BidStrategy_old";
ALTER TYPE "BidStrategy_new" RENAME TO "BidStrategy";
DROP TYPE "public"."BidStrategy_old";
ALTER TABLE "AutoBidConfig" ALTER COLUMN "biddingStrategy" SET DEFAULT 'SLOW';
COMMIT;

-- AlterTable
ALTER TABLE "AutoBidConfig" ALTER COLUMN "biddingStrategy" SET DEFAULT 'SLOW';
