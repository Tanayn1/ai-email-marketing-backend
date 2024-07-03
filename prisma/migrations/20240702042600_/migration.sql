/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Brands" (
    "id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "logos" TEXT[],
    "colors" TEXT[],
    "fonts" TEXT[],
    "brand_url" TEXT,

    CONSTRAINT "Brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "product_url" TEXT,
    "product_name" TEXT NOT NULL,
    "images" TEXT[],
    "description" TEXT NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brands_id_key" ON "Brands"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Products_id_key" ON "Products"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
