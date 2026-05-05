/*
  Warnings:

  - A unique constraint covering the columns `[userId,status]` on the table `UserSubscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSubscription_userId_status_key" ON "UserSubscription"("userId", "status");
