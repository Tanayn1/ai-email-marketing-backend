-- CreateTable
CREATE TABLE "Templates" (
    "id" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Templates_id_key" ON "Templates"("id");
