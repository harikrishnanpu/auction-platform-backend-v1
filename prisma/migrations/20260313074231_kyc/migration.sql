/*
  Warnings:

  - You are about to drop the column `isProfileCompleted` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID', 'KYC_ID');

-- CreateEnum
CREATE TYPE "KycFor" AS ENUM ('SELLER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "DocumentSide" AS ENUM ('FRONT', 'BACK');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OtpPurpose" ADD VALUE 'CHANGE_PROFILE_PASSWORD';
ALTER TYPE "OtpPurpose" ADD VALUE 'EDIT_PROFILE';

-- DropIndex
DROP INDEX "Otp_userId_purpose_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isProfileCompleted";

-- CreateTable
CREATE TABLE "Kyc" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL,
    "for" "KycFor" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "kycId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "side" "DocumentSide" NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kyc_userId_for_key" ON "Kyc"("userId", "for");

-- CreateIndex
CREATE UNIQUE INDEX "KycDocument_documentId_key" ON "KycDocument"("documentId");

-- AddForeignKey
ALTER TABLE "Kyc" ADD CONSTRAINT "Kyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycDocument" ADD CONSTRAINT "KycDocument_kycId_fkey" FOREIGN KEY ("kycId") REFERENCES "Kyc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
