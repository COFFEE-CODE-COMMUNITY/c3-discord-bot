/*
  Warnings:

  - You are about to drop the `AutoDeleteMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "StickyMessage_guildId_key";

-- DropTable
DROP TABLE "AutoDeleteMessage";
