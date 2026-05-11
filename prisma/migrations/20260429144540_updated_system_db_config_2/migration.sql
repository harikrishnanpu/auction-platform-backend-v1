/*
  Warnings:

  - You are about to drop the column `value` on the `Features` table. All the data in the column will be lost.
  - Added the required column `value` to the `SubscriptionPlanFeature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Features" DROP COLUMN "value";

-- AlterTable
ALTER TABLE "SubscriptionPlanFeature" ADD COLUMN     "value" TEXT NOT NULL;
