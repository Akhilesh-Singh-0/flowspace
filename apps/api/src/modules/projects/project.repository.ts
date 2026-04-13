import { prisma } from "@/lib/prisma"

type ProjectInput = {
  title: string
  description?: string
}

export const createProject = async (workspaceId: string, data: ProjectInput) => {
  return prisma.project.create({
    data: {
      workspaceId,
      title: data.title,
      description: data.description
    }
  })
}

export const viewProject =async (workspaceId: string) => {
  return prisma.project.findMany({
    where: {
      workspaceId
    }, select: {
      id: true,
      title: true,
      description: true,
      createdAt: true 
    }
  })
}

export const editProject =async (projectId: string, data: {title?: string, description?: string}) => {
  return prisma.project.update({
    where: {
      id: projectId
    }, data: {
      title: data.title,
      description: data.description
    }
  })
}