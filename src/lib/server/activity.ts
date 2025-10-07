import {
  ActivityPriority,
  ActivityStatus,
  ActivityType,
  Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const ACTIVITY_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

const COMMENT_INCLUDE = {
  author: {
    select: ACTIVITY_USER_SELECT,
  },
  mentions: {
    include: {
      user: {
        select: ACTIVITY_USER_SELECT,
      },
    },
  },
} satisfies Prisma.ActivityCommentInclude;

const ACTIVITY_INCLUDE = {
  lead: {
    select: {
      id: true,
      name: true,
      pipelineId: true,
      pipeline: {
        select: {
          id: true,
          name: true,
        },
      },
      stage: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  assignee: {
    select: ACTIVITY_USER_SELECT,
  },
  createdBy: {
    select: ACTIVITY_USER_SELECT,
  },
  followers: {
    include: {
      user: {
        select: ACTIVITY_USER_SELECT,
      },
    },
  },
  comments: {
    include: COMMENT_INCLUDE,
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ActivityInclude;

export const activityInclude = ACTIVITY_INCLUDE;

export type ActivityWithRelations = Prisma.ActivityGetPayload<{ include: typeof ACTIVITY_INCLUDE }>;
export type ActivityCommentWithRelations = Prisma.ActivityCommentGetPayload<{ include: typeof COMMENT_INCLUDE }>;

type PrismaClientOrTx = Prisma.TransactionClient | typeof prisma;

function getClient(client?: PrismaClientOrTx) {
  return client ?? prisma;
}

function normalizeTitle(type: ActivityType, content: string, leadName: string, provided?: string | null) {
  if (provided?.trim()) {
    return provided.trim().slice(0, 140);
  }

  if (type === ActivityType.task) {
    return content.slice(0, 140);
  }

  return `${type.toUpperCase()} • ${leadName}`.slice(0, 140);
}

async function ensureWorkspaceMember(
  workspaceId: string,
  userId: string | null | undefined,
  client?: PrismaClientOrTx,
) {
  if (!userId) return null;
  const db = getClient(client);
  const membership = await db.membership.findFirst({
    where: { workspaceId, userId },
    select: { userId: true },
  });
  if (!membership) {
    throw new Error("WORKSPACE_USER_NOT_FOUND");
  }
  return membership.userId;
}

async function filterWorkspaceMembers(
  workspaceId: string,
  userIds: string[] | undefined,
  client?: PrismaClientOrTx,
) {
  if (!userIds?.length) return [];
  const unique = Array.from(new Set(userIds.filter(Boolean)));
  if (!unique.length) return [];
  const db = getClient(client);
  const memberships = await db.membership.findMany({
    where: { workspaceId, userId: { in: unique } },
    select: { userId: true },
  });
  return memberships.map((membership) => membership.userId);
}

export async function fetchActivityById(
  activityId: string,
  client?: PrismaClientOrTx,
) {
  const db = getClient(client);
  return db.activity.findUnique({
    where: { id: activityId },
    include: ACTIVITY_INCLUDE,
  });
}

export function serializeActivity(activity: ActivityWithRelations) {
  return {
    id: activity.id,
    workspaceId: activity.workspaceId,
    lead: activity.lead
      ? {
          id: activity.lead.id,
          name: activity.lead.name,
          pipeline: activity.lead.pipeline
            ? {
                id: activity.lead.pipeline.id,
                name: activity.lead.pipeline.name,
              }
            : null,
          stage: activity.lead.stage
            ? {
                id: activity.lead.stage.id,
                name: activity.lead.stage.name,
              }
            : null,
        }
      : null,
    type: activity.type,
    title: activity.title,
    content: activity.content,
    status: activity.status,
    priority: activity.priority,
    dueAt: activity.dueAt ? activity.dueAt.toISOString() : null,
    completedAt: activity.completedAt ? activity.completedAt.toISOString() : null,
    assignee: activity.assignee
      ? {
          id: activity.assignee.id,
          name: activity.assignee.name,
          email: activity.assignee.email,
          image: activity.assignee.image,
        }
      : null,
    createdBy: activity.createdBy
      ? {
          id: activity.createdBy.id,
          name: activity.createdBy.name,
          email: activity.createdBy.email,
          image: activity.createdBy.image,
        }
      : null,
    followers: activity.followers.map((follower) => ({
      id: follower.user.id,
      name: follower.user.name,
      email: follower.user.email,
      image: follower.user.image,
    })),
    comments: activity.comments?.map((comment) => serializeComment(comment)) ?? [],
    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  };
}

export function serializeComment(comment: ActivityCommentWithRelations) {
  return {
    id: comment.id,
    activityId: comment.activityId,
    content: comment.content,
    author: comment.author
      ? {
          id: comment.author.id,
          name: comment.author.name,
          email: comment.author.email,
          image: comment.author.image,
        }
      : null,
    mentions: comment.mentions.map((mention) => ({
      id: mention.user.id,
      name: mention.user.name,
      email: mention.user.email,
      image: mention.user.image,
    })),
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

type CreateActivityParams = {
  workspaceId: string;
  leadId: string;
  type: ActivityType;
  content: string;
  title?: string | null;
  dueAt?: Date | null;
  status?: ActivityStatus;
  priority?: ActivityPriority;
  assigneeId?: string | null;
  createdById?: string | null;
  followers?: string[];
  client?: PrismaClientOrTx;
};

export async function createActivity({
  workspaceId,
  leadId,
  type,
  content,
  title,
  dueAt,
  status = ActivityStatus.OPEN,
  priority = ActivityPriority.MEDIUM,
  assigneeId,
  createdById,
  followers = [],
  client,
}: CreateActivityParams) {
  const db = getClient(client);

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      name: true,
      pipeline: {
        select: { workspaceId: true },
      },
    },
  });

  if (!lead || lead.pipeline.workspaceId !== workspaceId) {
    throw new Error("LEAD_NOT_FOUND");
  }

  const normalizedTitle = normalizeTitle(type, content, lead.name, title);
  const assignee = await ensureWorkspaceMember(workspaceId, assigneeId, db);
  const followerIds = await filterWorkspaceMembers(workspaceId, followers, db);

  const activity = await db.activity.create({
    data: {
      workspaceId,
      leadId,
      type,
      title: normalizedTitle,
      content,
      status,
      priority,
      dueAt: dueAt ?? null,
      completedAt: status === ActivityStatus.COMPLETED ? new Date() : null,
      assigneeId: assignee,
      createdById: createdById ?? null,
    },
    include: ACTIVITY_INCLUDE,
  });

  if (followerIds.length) {
    await db.activityFollower.createMany({
      data: followerIds.map((userId) => ({
        activityId: activity.id,
        userId,
      })),
      skipDuplicates: true,
    });
  }

  const fresh = await fetchActivityById(activity.id, db);
  if (!fresh) {
    throw new Error("ACTIVITY_NOT_FOUND");
  }

  return fresh;
}

type UpdateActivityParams = {
  activityId: string;
  workspaceId: string;
  data: {
    type?: ActivityType;
    title?: string | null;
    content?: string;
    dueAt?: Date | null | undefined;
    status?: ActivityStatus;
    priority?: ActivityPriority;
    assigneeId?: string | null | undefined;
    followers?: string[];
  };
  client?: PrismaClientOrTx;
};

export async function updateActivity({
  activityId,
  workspaceId,
  data,
  client,
}: UpdateActivityParams) {
  const db = getClient(client);

  const existing = await db.activity.findUnique({
    where: { id: activityId },
    include: ACTIVITY_INCLUDE,
  });

  if (!existing || existing.workspaceId !== workspaceId) {
    throw new Error("ACTIVITY_NOT_FOUND");
  }

  const updateData: Prisma.ActivityUpdateInput = {};

  if (data.type) {
    updateData.type = data.type;
  }

  if (data.title !== undefined) {
    updateData.title = data.title
      ? normalizeTitle(
          (updateData.type as ActivityType | undefined) ?? existing.type,
          data.content ?? existing.content,
          existing.lead?.name ?? "",
          data.title,
        )
      : "";
  }

  if (data.content !== undefined) {
    updateData.content = data.content;
  }

  if (data.dueAt !== undefined) {
    updateData.dueAt = data.dueAt;
  }

  if (data.status) {
    updateData.status = data.status;
    updateData.completedAt =
      data.status === ActivityStatus.COMPLETED ? new Date() : null;
  }

  if (data.priority) {
    updateData.priority = data.priority;
  }

  if (data.assigneeId !== undefined) {
    const assignee = await ensureWorkspaceMember(workspaceId, data.assigneeId, db);
    updateData.assignee = assignee
      ? {
          connect: { id: assignee },
        }
      : { disconnect: true };
  }

  if (Object.keys(updateData).length > 0) {
    await db.activity.update({
      where: { id: activityId },
      data: updateData,
    });
  }

  if (data.followers !== undefined) {
    const followerIds = await filterWorkspaceMembers(workspaceId, data.followers, db);
    await db.activityFollower.deleteMany({
      where: { activityId },
    });
    if (followerIds.length) {
      await db.activityFollower.createMany({
        data: followerIds.map((userId) => ({
          activityId,
          userId,
        })),
        skipDuplicates: true,
      });
    }
  }

  const fresh = await fetchActivityById(activityId, db);
  if (!fresh) {
    throw new Error("ACTIVITY_NOT_FOUND");
  }

  return fresh;
}

export async function deleteActivity(activityId: string, workspaceId: string) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { workspaceId: true },
  });

  if (!activity || activity.workspaceId !== workspaceId) {
    throw new Error("ACTIVITY_NOT_FOUND");
  }

  await prisma.activity.delete({ where: { id: activityId } });
}

type CreateCommentParams = {
  activityId: string;
  workspaceId: string;
  authorId: string | null;
  content: string;
  mentions?: string[];
};

export async function createActivityComment({
  activityId,
  workspaceId,
  authorId,
  content,
  mentions = [],
}: CreateCommentParams) {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { workspaceId: true },
  });

  if (!activity || activity.workspaceId !== workspaceId) {
    throw new Error("ACTIVITY_NOT_FOUND");
  }

  const comment = await prisma.activityComment.create({
    data: {
      activityId,
      authorId,
      content,
    },
    include: COMMENT_INCLUDE,
  });

  const mentionIds = await filterWorkspaceMembers(workspaceId, mentions);
  if (mentionIds.length) {
    await prisma.activityCommentMention.createMany({
      data: mentionIds.map((userId) => ({
        commentId: comment.id,
        userId,
      })),
      skipDuplicates: true,
    });
  }

  const fresh = await prisma.activityComment.findUnique({
    where: { id: comment.id },
    include: COMMENT_INCLUDE,
  });

  if (!fresh) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  return fresh;
}
