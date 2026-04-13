import { Router } from "express";
import { createProjectHandler, getProjectsHandler, updateProjectHandler } from "./project.controller"; 
import { validate } from "@/middleware/validate";
import { requireRole } from "@/middleware/requireRole";
import { authMiddleware } from "@/middleware/requireAuth";
import { ProjectInput, UpdateProject } from "./project.schema"; 

const router = Router()

router.post("/:id/projects", authMiddleware, requireRole("OWNER", "ADMIN"), validate(ProjectInput), createProjectHandler)

router.get("/:id/projects", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER", "VIEWER"), getProjectsHandler)

router.patch("/:id/projects/:projectId", authMiddleware, requireRole("OWNER","ADMIN"), validate(UpdateProject), updateProjectHandler)

export default router;