/*
  Warnings:

  - Added the required column `description` to the `SubscriptionPlanFeature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlanFeature" ADD COLUMN     "description" TEXT NOT NULL;
