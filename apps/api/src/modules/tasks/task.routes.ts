import { Router } from "express";
import { createTaskHandler, getTaskHandler, updateTaskHandler } from "./task.controller";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { authMiddleware } from "@/middleware/requireAuth";
import { TaskInput, UpdateTaskInput } from "./task.schema";

const router = Router()

router.post(
    ":workspaceId/projects/:projectId/tasks",
    authMiddleware,
    requireRole("OWNER", "ADMIN", "MEMBER"), 
    validate(TaskInput), 
    createTaskHandler
)

router.get(
    "/:workspaceId/projects/:projectId/tasks",
    authMiddleware, 
    requireRole("ADMIN", "OWNER", "MEMBER", "VIEWER"), 
    getTaskHandler)

router.patch(
    "/:workspaceId/tasks/:taskId",
    authMiddleware,
    requireRole("OWNER", "ADMIN", "MEMBER"),
    validate(UpdateTaskInput),
    updateTaskHandler
  )

export default router;