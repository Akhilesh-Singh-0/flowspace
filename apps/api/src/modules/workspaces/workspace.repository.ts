import { prisma } from "@/lib/prisma"
import { PrismaClient } from "@prisma/client"

type CreateWorkspaceInput = {
  name: string
  slug: string
}

type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

export const createWorkspaceWithOwner = async (
  userId: string,
  data: CreateWorkspaceInput
) => {
  return prisma.$transaction(async (tx: TransactionClient) => {
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

    return workspace
  })
}