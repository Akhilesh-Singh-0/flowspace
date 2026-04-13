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