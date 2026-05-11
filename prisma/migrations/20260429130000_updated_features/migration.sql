/*
  Warnings:

  - A unique constraint covering the columns `[feature]` on the table `Features` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[featureId]` on the table `SubscriptionPlanFeature` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Features_feature_key" ON "Features"("feature");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanFeature_featureId_key" ON "SubscriptionPlanFeature"("featureId");
