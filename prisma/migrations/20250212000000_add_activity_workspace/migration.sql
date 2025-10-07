-- Add workspaceId to activities and backfill existing data
ALTER TABLE "Activity" ADD COLUMN "workspaceId" TEXT;

UPDATE "Activity" AS a
SET "workspaceId" = p."workspaceId"
FROM "Lead" AS l
JOIN "Pipeline" AS p ON l."pipelineId" = p."id"
WHERE a."leadId" = l."id";

ALTER TABLE "Activity" ALTER COLUMN "workspaceId" SET NOT NULL;

ALTER TABLE "Activity"
  ADD CONSTRAINT "Activity_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "Activity_workspaceId_idx" ON "Activity" ("workspaceId");
