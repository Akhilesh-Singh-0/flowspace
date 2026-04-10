import { prisma } from "@/lib/prisma"
import { PrismaClient, WorkspaceRole } from "@prisma/client"

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

export const findWorkspacesByUserId =async (userId: string) => {
  return prisma.workspaceMember.findMany({
    where: {
      userId: userId
    },
    select: {
      role: true,
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true
        }
      }
    }
  })
}

export const findWorkspaceMember =async (userId : string, workspaceId : string) => {
  return prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    },
    select:{
      role: true
    }
  })
}

export const findUserById =async (userId : string) => {
  return prisma.user.findUnique({
    where : {
      id: userId
    },
    select: {
      id: true
    }
  })
}

export const createWorkspaceMember =async (userId: string, workspaceId: string, role: WorkspaceRole) => {
  const workspaceMember = await prisma.workspaceMember.create({
    data: {
      userId,
      workspaceId,
      role: role
    }
  })
  return workspaceMember
}

export const deleteWorkspaceMember = async (userId: string, workspaceId: string) => {
  return prisma.workspaceMember.delete({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  })
}

export const findWorkspaceMembers =async (workspaceId: string) => {
  return prisma.workspaceMember.findMany({
    where: {
      workspaceId
    }, select: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true
        }
      }
    }
  })
}

export const findUserByClerkId = async (clerkId: string) => {
  return prisma.user.findUnique({
    where: { clerkId },
    select: { id: true }
  })
}