/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionPlanId,featureId]` on the table `SubscriptionPlanFeature` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SubscriptionPlanFeature_featureId_key";

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanFeature_subscriptionPlanId_featureId_key" ON "SubscriptionPlanFeature"("subscriptionPlanId", "featureId");
