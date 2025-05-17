-- CreateTable
CREATE TABLE "AutoDeleteMessage" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutoDeleteMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutoDeleteMessage_channelId_key" ON "AutoDeleteMessage"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "AutoDeleteMessage_guildId_key" ON "AutoDeleteMessage"("guildId");
