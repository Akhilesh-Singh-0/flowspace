import { Router } from "express";
import { createProjectHandler, getProjectsHandler, updateProjectHandler, deleteProjectHandler } from "./project.controller";
import { validate } from "@/middleware/validate";
import { requireRole } from "@/middleware/requireRole";
import { authMiddleware } from "@/middleware/requireAuth";
import { ProjectInput, UpdateProject } from "./project.schema";

const router = Router()

/**
 * @swagger
 * /workspaces/{id}/projects:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 *       403:
 *         description: Forbidden
 */
router.post("/:id/projects", authMiddleware, requireRole("OWNER", "ADMIN"), validate(ProjectInput), createProjectHandler)

/**
 * @swagger
 * /workspaces/{id}/projects:
 *   get:
 *     summary: List all projects in a workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of projects
 *       403:
 *         description: Forbidden
 */
router.get("/:id/projects", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER", "VIEWER"), getProjectsHandler)

/**
 * @swagger
 * /workspaces/{id}/projects/{projectId}:
 *   patch:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated
 *       403:
 *         description: Forbidden
 */
router.patch("/:id/projects/:projectId", authMiddleware, requireRole("OWNER", "ADMIN"), validate(UpdateProject), updateProjectHandler)

/**
 * @swagger
 * /workspaces/{id}/projects/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project deleted
 *       403:
 *         description: Forbidden
 */
router.delete("/:id/projects/:projectId", authMiddleware, requireRole("OWNER", "ADMIN"), deleteProjectHandler)

export default router