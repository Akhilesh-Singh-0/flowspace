import { Router } from "express";
import { createLabelHandler, createAssignLabelHandler, getLabelHandler, deleteLabelFromTask } from "./label.controller";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { authMiddleware } from "@/middleware/requireAuth";
import { LabelInput, AssignLabelInput } from "./label.schema";

const router = Router()

/**
 * @swagger
 * /workspaces/{workspaceId}/labels:
 *   post:
 *     summary: Create a label in a workspace
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, color]
 *             properties:
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Label created
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Label already exists
 */
router.post("/:workspaceId/labels", authMiddleware, requireRole("OWNER", "ADMIN"), validate(LabelInput), createLabelHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}/labels:
 *   post:
 *     summary: Assign a label to a task
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [labelId]
 *             properties:
 *               labelId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Label assigned
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Label already assigned
 */
router.post("/:workspaceId/tasks/:taskId/labels", authMiddleware, requireRole("OWNER", "ADMIN"), validate(AssignLabelInput), createAssignLabelHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}/labels:
 *   get:
 *     summary: Get all labels on a task
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of labels
 *       403:
 *         description: Forbidden
 */
router.get("/:workspaceId/tasks/:taskId/labels", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER", "VIEWER"), getLabelHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}/labels/{labelId}:
 *   delete:
 *     summary: Remove a label from a task
 *     tags: [Labels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: labelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Label removed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Label not found
 */
router.delete("/:workspaceId/tasks/:taskId/labels/:labelId", authMiddleware, requireRole("OWNER", "ADMIN"), deleteLabelFromTask)

export default router