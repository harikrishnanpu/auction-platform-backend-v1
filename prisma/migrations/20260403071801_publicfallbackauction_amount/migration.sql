/*
  Warnings:

  - Added the required column `amount` to the `PublicFallbackAuction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PublicFallbackAuction" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL;
