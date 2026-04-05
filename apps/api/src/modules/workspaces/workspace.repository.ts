import { prisma } from "@/lib/prisma";

type CreateWorkspaceInput = {
  name: string;
  slug: string;
}

export const createWorkspaceWithOwner = async (
  userId: string,
  data: CreateWorkspaceInput
) => {
  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
      }
    })

    await tx.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: "OWNER",
      }
    })

    return workspace;
  })
};