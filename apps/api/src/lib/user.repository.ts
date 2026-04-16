import { prisma } from "@/lib/prisma"

export const findUserByClerkId = async (clerkId: string) => {
    // BUGFIX: previously this queried `where: { id: clerkId }`, which would
    // almost always miss because the `id` column is a cuid and `clerkId` is
    // a separate unique column. That broke task creation (addTask -> "User
    // not found" 404). Query the correct column.
    return prisma.user.findUnique({
        where: {
            clerkId
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
