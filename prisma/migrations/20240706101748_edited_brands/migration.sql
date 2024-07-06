/*
  Warnings:

  - You are about to drop the column `logos` on the `Brands` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brands" DROP COLUMN "logos",
ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "price" DROP NOT NULL;
