-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'DECLINED');

-- CreateEnum
CREATE TYPE "PaymentFor" AS ENUM ('AUCTION');

-- CreateEnum
CREATE TYPE "PaymentPhase" AS ENUM ('DEPOSIT', 'BALANCE');

-- CreateTable
CREATE TABLE "Payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL,
    "for" "PaymentFor" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "phase" "PaymentPhase" NOT NULL DEFAULT 'DEPOSIT',
    "dueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payments_referenceId_userId_phase_key" ON "Payments"("referenceId", "userId", "phase");

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
