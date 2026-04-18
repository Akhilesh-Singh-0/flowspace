import { Router } from "express";
import { createLabelHandler } from "./label.controller";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { authMiddleware } from "@/middleware/requireAuth";
import { LabelInput } from "./label.schema";

const router = Router()

router.post("/:workspaceId/labels", authMiddleware, requireRole("OWNER", "ADMIN"), validate(LabelInput), createLabelHandler)

export default router;