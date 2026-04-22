/*
  Warnings:

  - The values [ADMIN] on the enum `FraudReporterType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `evidence` on the `FraudReport` table. All the data in the column will be lost.
  - You are about to drop the column `reporterUserId` on the `FraudReport` table. All the data in the column will be lost.
  - You are about to drop the column `severity` on the `FraudReport` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `UserSuspension` table. All the data in the column will be lost.
  - Added the required column `level` to the `FraudReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetedUserId` to the `FraudReport` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FraudReportLevel" AS ENUM ('LOW', 'MEDIUM', 'CRITICAL');

-- AlterEnum
BEGIN;
CREATE TYPE "FraudReporterType_new" AS ENUM ('USER', 'SELLER', 'SYSTEM');
ALTER TABLE "FraudReport" ALTER COLUMN "reporterType" TYPE "FraudReporterType_new" USING ("reporterType"::text::"FraudReporterType_new");
ALTER TYPE "FraudReporterType" RENAME TO "FraudReporterType_old";
ALTER TYPE "FraudReporterType_new" RENAME TO "FraudReporterType";
DROP TYPE "public"."FraudReporterType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "FraudReport" DROP CONSTRAINT "FraudReport_reporterUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserSuspension" DROP CONSTRAINT "UserSuspension_createdById_fkey";

-- AlterTable
ALTER TABLE "FraudReport" DROP COLUMN "evidence",
DROP COLUMN "reporterUserId",
DROP COLUMN "severity",
ADD COLUMN     "level" "FraudReportLevel" NOT NULL,
ADD COLUMN     "targetedUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userFraudLevel" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserSuspension" DROP COLUMN "createdById";

-- DropEnum
DROP TYPE "FraudReportSeverity";

-- AddForeignKey
ALTER TABLE "FraudReport" ADD CONSTRAINT "FraudReport_targetedUserId_fkey" FOREIGN KEY ("targetedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
