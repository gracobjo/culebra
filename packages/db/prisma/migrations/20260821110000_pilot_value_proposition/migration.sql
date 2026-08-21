-- CreateTable
CREATE TABLE "PilotValueProposition" (
    "id" TEXT NOT NULL,
    "pilotProducerId" TEXT NOT NULL,
    "headline" TEXT,
    "context" TEXT,
    "benefits" TEXT,
    "offerTerms" TEXT,
    "productMix" TEXT,
    "nextSteps" TEXT,
    "internalNotes" TEXT,
    "preparedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "preparedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PilotValueProposition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PilotValueProposition_pilotProducerId_key" ON "PilotValueProposition"("pilotProducerId");

-- AddForeignKey
ALTER TABLE "PilotValueProposition" ADD CONSTRAINT "PilotValueProposition_pilotProducerId_fkey" FOREIGN KEY ("pilotProducerId") REFERENCES "PilotProducer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
