import { prisma } from "@/lib/prisma";
type user = {
    clerkId: string;
    email: string;
    name: string;
}
export const createUser = async (user: user) => {
    return prisma.user.upsert({
        where: { clerkId: user.clerkId },
        update: {
            email: user.email,
            name: user.name
        },
        create: {
            clerkId: user.clerkId,
            email: user.email,
            name: user.name
        }
    })
}
