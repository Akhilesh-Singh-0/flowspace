import { Router } from "express";
import { createTaskHandler } from "./task.controller";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { authMiddleware } from "@/middleware/requireAuth";
import { TaskInput } from "./task.schema";

const router = Router()

router.post("/:workspaceId/projects/:projectId/tasks", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER"), validate(TaskInput), createTaskHandler)

export default router;

//"id": "cmny5xfu60003riau2gnff88a",
//"projectId": "cmny5g7ak00014uvr91lumx3k",
//"workspaceId": "cmntwh65k00017mnozu0vk5m3",
