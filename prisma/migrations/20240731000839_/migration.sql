/*
  Warnings:

  - You are about to drop the column `logo` on the `Brands` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brands" DROP COLUMN "logo",
ADD COLUMN     "logos" TEXT[];
