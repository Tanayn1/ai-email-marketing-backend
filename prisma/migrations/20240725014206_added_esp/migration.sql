-- CreateTable
CREATE TABLE "ESP" (
    "id" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ESP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ESP_id_key" ON "ESP"("id");
