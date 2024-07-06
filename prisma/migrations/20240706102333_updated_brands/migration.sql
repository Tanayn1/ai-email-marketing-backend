/*
  Warnings:

  - Changed the type of `colors` on the `Brands` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `fonts` on the `Brands` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Brands" DROP COLUMN "colors",
ADD COLUMN     "colors" JSONB NOT NULL,
DROP COLUMN "fonts",
ADD COLUMN     "fonts" JSONB NOT NULL;
