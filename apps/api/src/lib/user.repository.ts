import { prisma } from "@/lib/prisma"

export const findUserByClerkId = async (clerkId: string) => {
    return prisma.user.findUnique({
        where: {
            id: clerkId
        },
        select: {
            id: true
        }
    })
}

export const findUserById = async (userId: string) => {
    return prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })
}