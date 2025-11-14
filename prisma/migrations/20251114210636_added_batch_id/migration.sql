/*
  Warnings:

  - Added the required column `batchId` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "batchId" TEXT NOT NULL,
ALTER COLUMN "bonoNumber" DROP NOT NULL,
ALTER COLUMN "bonoNumber" DROP DEFAULT;
