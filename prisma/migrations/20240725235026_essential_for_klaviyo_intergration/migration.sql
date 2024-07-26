-- CreateTable
CREATE TABLE "KlaviyoTemplates" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KlaviyoTemplates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KlaviyoCampaigns" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KlaviyoCampaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KlaviyoTemplates_id_key" ON "KlaviyoTemplates"("id");

-- CreateIndex
CREATE UNIQUE INDEX "KlaviyoTemplates_template_id_key" ON "KlaviyoTemplates"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "KlaviyoCampaigns_id_key" ON "KlaviyoCampaigns"("id");

-- CreateIndex
CREATE UNIQUE INDEX "KlaviyoCampaigns_campaign_id_key" ON "KlaviyoCampaigns"("campaign_id");
