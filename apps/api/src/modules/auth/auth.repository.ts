import { prisma } from "@/lib/prisma";

type user = {
    clerkId: string;
    email: string;
    name: string;
}

export const createUser =async (user: user) => {
    return prisma.user.create({
        data: {
            clerkId: user.clerkId,
            email: user.email,
            name: user.name 
        }
    })
}