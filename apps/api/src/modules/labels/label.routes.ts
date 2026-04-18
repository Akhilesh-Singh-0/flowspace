import { Router } from "express";
import { 
    createLabelHandler,
    createAssignLabelHandler,
    getLabelHandler,
    deleteLabelFromTask 
} from "./label.controller";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { authMiddleware } from "@/middleware/requireAuth";
import { LabelInput, AssignLabelInput } from "./label.schema";

const router = Router()

router.post("/:workspaceId/labels", authMiddleware, requireRole("OWNER", "ADMIN"), validate(LabelInput), createLabelHandler)

router.post("/:workspaceId/tasks/:taskId/labels", authMiddleware, requireRole("OWNER", "ADMIN"), validate(AssignLabelInput), createAssignLabelHandler)

router.get("/:workspaceId/tasks/:taskId/labels", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER", "VIEWER"), getLabelHandler)

router.delete("/:workspaceId/tasks/:taskId/labels/:labelId", authMiddleware, requireRole("OWNER", "ADMIN"), deleteLabelFromTask)

export default router;