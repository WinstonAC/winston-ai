/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Segment` table. All the data in the column will be lost.
  - You are about to drop the column `segment` on the `TargetAudience` table. All the data in the column will be lost.
  - Added the required column `segmentId` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Segment` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Segment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Segment" DROP CONSTRAINT "Segment_createdBy_fkey";

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "segmentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Segment" DROP COLUMN "createdBy",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "TargetAudience" DROP COLUMN "segment";

-- CreateTable
CREATE TABLE "PerformanceMetrics" (
    "id" SERIAL NOT NULL,
    "pageLoadTime" DOUBLE PRECISION NOT NULL,
    "apiResponseTime" DOUBLE PRECISION NOT NULL,
    "databaseQueryTime" DOUBLE PRECISION NOT NULL,
    "memoryUsage" DOUBLE PRECISION NOT NULL,
    "cpuUsage" DOUBLE PRECISION,
    "networkLatency" DOUBLE PRECISION,
    "userId" TEXT,
    "path" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PerformanceMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "userId" TEXT,
    "path" TEXT,
    "method" TEXT,
    "statusCode" INTEGER,
    "userAgent" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'error',
    "environment" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiMetrics" (
    "id" SERIAL NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "userId" TEXT,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "error" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PerformanceMetrics_timestamp_idx" ON "PerformanceMetrics"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceMetrics_userId_idx" ON "PerformanceMetrics"("userId");

-- CreateIndex
CREATE INDEX "ErrorLog_timestamp_idx" ON "ErrorLog"("timestamp");

-- CreateIndex
CREATE INDEX "ErrorLog_userId_idx" ON "ErrorLog"("userId");

-- CreateIndex
CREATE INDEX "ErrorLog_severity_idx" ON "ErrorLog"("severity");

-- CreateIndex
CREATE INDEX "ErrorLog_environment_idx" ON "ErrorLog"("environment");

-- CreateIndex
CREATE INDEX "ApiMetrics_timestamp_idx" ON "ApiMetrics"("timestamp");

-- CreateIndex
CREATE INDEX "ApiMetrics_userId_idx" ON "ApiMetrics"("userId");

-- CreateIndex
CREATE INDEX "ApiMetrics_endpoint_idx" ON "ApiMetrics"("endpoint");

-- CreateIndex
CREATE INDEX "ApiMetrics_statusCode_idx" ON "ApiMetrics"("statusCode");

-- CreateIndex
CREATE INDEX "Campaign_segmentId_idx" ON "Campaign"("segmentId");

-- CreateIndex
CREATE INDEX "Segment_userId_idx" ON "Segment"("userId");

-- CreateIndex
CREATE INDEX "Segment_teamId_idx" ON "Segment"("teamId");

-- AddForeignKey
ALTER TABLE "Segment" ADD CONSTRAINT "Segment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceMetrics" ADD CONSTRAINT "PerformanceMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiMetrics" ADD CONSTRAINT "ApiMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
