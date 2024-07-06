/*
  Warnings:

  - The `colors` column on the `Brands` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fonts` column on the `Brands` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `description` column on the `Products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Brands" DROP COLUMN "colors",
ADD COLUMN     "colors" JSONB[],
DROP COLUMN "fonts",
ADD COLUMN     "fonts" JSONB[];

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "product_name" DROP NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" TEXT[];
