/*
  Warnings:

  - You are about to drop the column `description` on the `SystemDbConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SystemDbConfig" DROP COLUMN "description",
ALTER COLUMN "value" SET DATA TYPE TEXT;
