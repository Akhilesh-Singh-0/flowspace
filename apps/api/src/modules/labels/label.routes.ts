import { Router } from "express";
import { 
    createLabelHandler,
    createAssignLabelHandler, 
} from "./label.controller";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { authMiddleware } from "@/middleware/requireAuth";
import { LabelInput, AssignLabelInput } from "./label.schema";

const router = Router()

router.post("/:workspaceId/labels", authMiddleware, requireRole("OWNER", "ADMIN"), validate(LabelInput), createLabelHandler)

router.post("/:workspaceId/tasks/:taskId/labels", authMiddleware, requireRole("OWNER", "ADMIN"), validate(AssignLabelInput), createAssignLabelHandler)

export default router;