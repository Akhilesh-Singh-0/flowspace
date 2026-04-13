import { Router } from "express";
import { createProjectHandler } from "./project.controller"; 
import { validate } from "@/middleware/validate";
import { requireRole } from "@/middleware/requireRole";
import { authMiddleware } from "@/middleware/requireAuth";
import { ProjectInput } from "./project.schema"; 

const router = Router()

router.post("/:id/projects", authMiddleware, requireRole("OWNER", "ADMIN"), validate(ProjectInput), createProjectHandler)

export default router;