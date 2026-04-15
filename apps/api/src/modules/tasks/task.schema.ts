import { z } from "zod";
import { TaskStatus, TaskPriority } from "@prisma/client";

export const TaskInput = z.object({
    title: z.string().trim().min(1).max(100),
    description: z.string().trim().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.coerce.date().optional()
})
export type TaskInputType = z.infer<typeof TaskInput>

export const UpdateTaskInput = z.object({
    title: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    dueDate: z.coerce.date().optional()
})
export type UpdateInputType = z.infer<typeof UpdateTaskInput>