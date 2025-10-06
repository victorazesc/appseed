-- CreateEnum
CREATE TYPE "StageTransitionMode" AS ENUM ('NONE', 'MANUAL', 'AUTO');

-- AlterTable Pipeline
ALTER TABLE "Pipeline"
  ADD COLUMN "webhookToken" TEXT,
  ADD COLUMN "webhookSlug" TEXT,
  ADD COLUMN "webhookDefaultStageId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Pipeline_webhookToken_key" ON "Pipeline" ("webhookToken") WHERE "webhookToken" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Pipeline_webhookSlug_key" ON "Pipeline" ("webhookSlug") WHERE "webhookSlug" IS NOT NULL;

-- AlterTable Stage
ALTER TABLE "Stage"
  ADD COLUMN "transitionMode" "StageTransitionMode" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "transitionTargetPipelineId" TEXT,
  ADD COLUMN "transitionTargetStageId" TEXT,
  ADD COLUMN "transitionCopyActivities" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "transitionArchiveSource" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Stage_transitionTargetPipelineId_idx" ON "Stage" ("transitionTargetPipelineId");

-- AlterTable Lead
ALTER TABLE "Lead"
  ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Lead_archived_idx" ON "Lead" ("archived");

UPDATE "Pipeline"
SET
  "webhookToken" = md5(random()::text || clock_timestamp()::text || coalesce("id", '')),
  "webhookSlug" = concat(
    lower(regexp_replace("name", '[^a-z0-9]+', '-', 'g')),
    '-',
    substr(md5(random()::text || clock_timestamp()::text || coalesce("id", '')), 1, 8)
  )
WHERE "webhookToken" IS NULL;
