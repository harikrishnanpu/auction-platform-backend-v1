/*
  Warnings:

  - A unique constraint covering the columns `[userId,purpose]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Otp_userId_purpose_key" ON "Otp"("userId", "purpose");
