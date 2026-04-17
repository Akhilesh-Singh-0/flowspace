import { prisma } from "@/lib/prisma";

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