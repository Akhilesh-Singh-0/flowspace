import { prisma } from "@/lib/prisma";

export const findTaskById = async (taskId: string) => {
    return prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        projectId: true
      }
    })
}

export const createComment = async (taskId: string, authorId: string, body: string) => {
    return prisma.comment.create({
        data: {
            taskId,
            authorId,
            body
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    avatarUrl: true
                }
            }
        }
    })
}

export const viewComment = async (taskId: string) => {
    return prisma.comment.findMany({
        where: {
            taskId
        },
        include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true
              }
            }
        }
    })
}

export const findCommentById = async (commentId: string) => {
    return prisma.comment.findUnique({
      where: { id: commentId },
      select: { 
        id: true,
        taskId: true 
    }
    })
}

export const removeComment = async (commentId: string) => {
    return prisma.comment.delete({
        where: {
            id: commentId
        }
    })
}