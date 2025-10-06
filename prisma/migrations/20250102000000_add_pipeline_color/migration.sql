-- AlterTable
ALTER TABLE "public"."Pipeline" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#16A34A';

-- CreateIndex
CREATE INDEX "Pipeline_archived_idx" ON "public"."Pipeline"("archived");
