/*
  Warnings:

  - You are about to drop the column `description` on the `SubscriptionPlanFeature` table. All the data in the column will be lost.
  - You are about to drop the column `feature` on the `SubscriptionPlanFeature` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `SubscriptionPlanFeature` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `SubscriptionPlanFeature` table. All the data in the column will be lost.
  - Added the required column `featureId` to the `SubscriptionPlanFeature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlanFeature" DROP COLUMN "description",
DROP COLUMN "feature",
DROP COLUMN "type",
DROP COLUMN "value",
ADD COLUMN     "featureId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Features" (
    "id" TEXT NOT NULL,
    "feature" "SubscriptionPlanFeatureEnum" NOT NULL,
    "description" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "SubscriptionPlanFeatureType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Features_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubscriptionPlanFeature" ADD CONSTRAINT "SubscriptionPlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
