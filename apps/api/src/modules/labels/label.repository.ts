import { prisma } from "@/lib/prisma";

export const findLabelByName = async (workspaceId: string, name: string) => {
    return prisma.label.findUnique({
        where: {
            workspaceId_name: { workspaceId, name }
        }
    })
}

export const createLabel = async (workspaceId: string, name: string, color: string) => {
    return prisma.label.create({
        data: {
            workspaceId,
            name,
            color,
        }
    })
}