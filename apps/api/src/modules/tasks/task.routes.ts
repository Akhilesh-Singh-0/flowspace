import { Router } from "express";
import { createTaskHandler, getTaskHandler, updateTaskHandler, deleteTaskHandler } from "./task.controller";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { authMiddleware } from "@/middleware/requireAuth";
import { TaskInput, UpdateTaskInput } from "./task.schema";

const router = Router()

/**
 * @swagger
 * /workspaces/{workspaceId}/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: projectId
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
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *               priority:
 *                 type: string
 *                 enum: [URGENT, HIGH, MEDIUM, LOW]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Task created
 *       403:
 *         description: Forbidden
 */
router.post("/:workspaceId/projects/:projectId/tasks", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER"), validate(TaskInput), createTaskHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/projects/{projectId}/tasks:
 *   get:
 *     summary: List all tasks in a project
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
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
 *         description: List of tasks
 *       403:
 *         description: Forbidden
 */
router.get("/:workspaceId/projects/:projectId/tasks", authMiddleware, requireRole("ADMIN", "OWNER", "MEMBER", "VIEWER"), getTaskHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}:
 *   patch:
 *     summary: Update a task
 *     tags: [Tasks]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *               priority:
 *                 type: string
 *                 enum: [URGENT, HIGH, MEDIUM, LOW]
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.patch("/:workspaceId/tasks/:taskId", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER"), validate(UpdateTaskInput), updateTaskHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
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
 *         description: Task deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Task not found
 */
router.delete("/:workspaceId/tasks/:taskId", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER"), deleteTaskHandler)

export default router