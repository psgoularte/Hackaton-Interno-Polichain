/*
  Warnings:

  - You are about to alter the column `duration` on the `Raffle` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `maxTickets` on the `Raffle` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Raffle" ALTER COLUMN "duration" SET DATA TYPE INTEGER,
ALTER COLUMN "maxTickets" SET DATA TYPE INTEGER;
