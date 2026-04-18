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

export const findLabelById = async (labelId: string) => {
    return prisma.label.findUnique({
      where: { id: labelId },
      select: { 
        id: true, 
        workspaceId: true 
        }
    })
}

export const findTaskLabelById = async (taskId: string, labelId: string) => {
    return prisma.taskLabel.findUnique({
        where: {
            taskId_labelId: {
                taskId, 
                labelId
            }
        }
    })
}

export const assignLabel = async (taskId: string, labelId: string) => {
    return prisma.taskLabel.create({
      data: { taskId, labelId }
    })
}

export const fetchTaskLabels = async (taskId: string) => {
    return prisma.taskLabel.findMany({
        where: {
            taskId
        },
        include: {
            label: {
                select: {
                    id: true,
                    name: true,
                    color: true
                }
            }
        }
    })
}