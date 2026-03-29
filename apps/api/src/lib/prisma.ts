import { PrismaClient } from "@/lib/logger";
import { logger } from "@/lib/logger";
import e from "express";
import { string } from "zod";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ??
new PrismaClient({
    log: [{emit: 'event', level: 'error'}],
})

prisma.$on('error', (e: {message: string; target: string}) => {
    logger.error('Prisma error', {message: e.message})
})

if(process.env.NODE_ENV !== 'production'){
    globalForPrisma.prisma = prisma
}