-- CreateEnum
CREATE TYPE "PilotStatus" AS ENUM ('IDENTIFIED', 'CONTACTED', 'NEGOTIATING', 'ONBOARDED', 'BETA_TESTING', 'ACTIVE', 'DECLINED');

-- CreateEnum
CREATE TYPE "PilotTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateTable
CREATE TABLE "PilotProducer" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "producerName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "status" "PilotStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "commissionPct" DECIMAL(5,2) NOT NULL DEFAULT 10,
    "founderDiscount" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "vendorId" TEXT,
    "visitDate" TIMESTAMP(3),
    "onboardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotProducer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PilotTask" (
    "id" TEXT NOT NULL,
    "pilotProducerId" TEXT NOT NULL,
    "phase" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "PilotTaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PilotProducer_vendorId_key" ON "PilotProducer"("vendorId");

-- CreateIndex
CREATE INDEX "PilotProducer_status_idx" ON "PilotProducer"("status");

-- CreateIndex
CREATE INDEX "PilotTask_pilotProducerId_phase_idx" ON "PilotTask"("pilotProducerId", "phase");

-- AddForeignKey
ALTER TABLE "PilotProducer" ADD CONSTRAINT "PilotProducer_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotTask" ADD CONSTRAINT "PilotTask_pilotProducerId_fkey" FOREIGN KEY ("pilotProducerId") REFERENCES "PilotProducer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
