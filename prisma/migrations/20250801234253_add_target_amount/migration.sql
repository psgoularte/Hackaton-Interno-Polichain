/*
  Warnings:

  - Added the required column `targetAmount` to the `Raffle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Raffle" ADD COLUMN     "targetAmount" DOUBLE PRECISION NOT NULL;
