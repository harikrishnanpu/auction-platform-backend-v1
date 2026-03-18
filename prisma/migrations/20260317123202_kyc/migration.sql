/*
  Warnings:

  - A unique constraint covering the columns `[kycId,documentType,side]` on the table `KycDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KycDocument_kycId_documentType_side_key" ON "KycDocument"("kycId", "documentType", "side");
