-- Create enums
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'ADMIN_GLOBAL');
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
CREATE TYPE "UserTokenPurpose" AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'INVITE');

-- Users and auth tables
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "image" TEXT,
  "passwordHash" TEXT,
  "emailVerified" TIMESTAMP,
  "globalRole" "GlobalRole" NOT NULL DEFAULT 'USER',
  "onboardingComplete" BOOLEAN NOT NULL DEFAULT FALSE,
  "lastLoginAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "User_email_key" ON "User" (LOWER("email"));
CREATE INDEX "User_globalRole_idx" ON "User" ("globalRole");

CREATE TABLE "Account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "oauth_token_secret" TEXT,
  "oauth_token" TEXT,
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account" ("provider", "providerAccountId");

CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session" ("sessionToken");

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken" ("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken" ("identifier", "token");

-- Workspace tables
CREATE TABLE "Workspace" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#16A34A',
  "archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdById" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Workspace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace" ("slug");

CREATE TABLE "Membership" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
  "invitedById" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "Membership_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX "Membership_user_workspace_unique" ON "Membership" ("userId", "workspaceId");
CREATE INDEX "Membership_workspace_role_idx" ON "Membership" ("workspaceId", "role");

CREATE TABLE "Invite" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
  "workspaceId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "Invite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "Invite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Invite_token_key" ON "Invite" ("token");
CREATE INDEX "Invite_email_idx" ON "Invite" (LOWER("email"));

CREATE TABLE "UserToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "email" TEXT,
  "token" TEXT NOT NULL,
  "purpose" "UserTokenPurpose" NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "consumedAt" TIMESTAMP,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "UserToken_token_key" ON "UserToken" ("token");
CREATE INDEX "UserToken_purpose_expires_idx" ON "UserToken" ("purpose", "expiresAt");

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "workspaceId" TEXT,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE,
  CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL
);

CREATE INDEX "AuditLog_workspace_idx" ON "AuditLog" ("workspaceId");
CREATE INDEX "AuditLog_actor_idx" ON "AuditLog" ("actorUserId");

CREATE TABLE "ImpersonationSession" (
  "id" TEXT PRIMARY KEY,
  "adminUserId" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "endedAt" TIMESTAMP,
  CONSTRAINT "ImpersonationSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "ImpersonationSession_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE
);

CREATE INDEX "ImpersonationSession_admin_idx" ON "ImpersonationSession" ("adminUserId");
CREATE INDEX "ImpersonationSession_workspace_idx" ON "ImpersonationSession" ("workspaceId");

-- Seed legacy workspace for existing data
INSERT INTO "Workspace" ("id", "name", "slug", "color", "archived", "createdAt", "updatedAt")
VALUES ('legacy-workspace', 'Legacy Workspace', 'legacy', '#16A34A', FALSE, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;

-- Update pipeline table to support workspaces
ALTER TABLE "Pipeline" ADD COLUMN "workspaceId" TEXT NOT NULL DEFAULT 'legacy-workspace';

UPDATE "Pipeline" SET "workspaceId" = 'legacy-workspace' WHERE "workspaceId" IS NULL;

ALTER TABLE "Pipeline"
  ADD CONSTRAINT "Pipeline_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Pipeline_name_key'
  ) THEN
    EXECUTE 'DROP INDEX "Pipeline_name_key"';
  END IF;
END $$;

CREATE UNIQUE INDEX "Pipeline_workspaceId_name_key" ON "Pipeline"("workspaceId", "name");
CREATE INDEX "Pipeline_workspaceId_idx" ON "Pipeline"("workspaceId");

-- Trigger to maintain updatedAt fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workspace_updated_at
BEFORE UPDATE ON "Workspace"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_updated_at
BEFORE UPDATE ON "Membership"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ensure existing pipelines have matching color default
UPDATE "Pipeline" SET "color" = '#16A34A' WHERE "color" IS NULL;
