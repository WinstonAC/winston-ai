-- CreateTable
CREATE TABLE "ChatbotInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "command" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "page" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "teamId" TEXT,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "ChatbotInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotInteraction_userId_idx" ON "ChatbotInteraction"("userId");

-- CreateIndex
CREATE INDEX "ChatbotInteraction_sessionId_idx" ON "ChatbotInteraction"("sessionId");

-- CreateIndex
CREATE INDEX "ChatbotInteraction_timestamp_idx" ON "ChatbotInteraction"("timestamp");
