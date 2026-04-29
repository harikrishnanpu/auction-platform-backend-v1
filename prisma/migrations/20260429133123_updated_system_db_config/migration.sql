/*
  Warnings:

  - Added the required column `type` to the `SystemDbConfig` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `SystemDbConfig` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SystemConfigValueType" AS ENUM ('NUMBER', 'STRING', 'BOOLEAN');

-- AlterTable
ALTER TABLE "SystemDbConfig" ADD COLUMN     "type" "SystemConfigValueType" NOT NULL,
ALTER COLUMN "description" SET NOT NULL;
