/*
  Warnings:

  - Added the required column `address` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxTickets` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prizeValue` to the `Raffle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketPrize` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Raffle" ADD COLUMN     "address" VARCHAR(64) NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "maxTickets" INTEGER NOT NULL,
ADD COLUMN     "prizeValue" INTEGER NOT NULL,
ADD COLUMN     "ticketPrize" INTEGER NOT NULL;
