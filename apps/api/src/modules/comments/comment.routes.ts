import { Router } from "express";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { createCommentHandler, getCommentHandler, deleteCommentHandler } from "./comment.controller";
import { CommentInput } from "./comment.schema";
import { authMiddleware } from "@/middleware/requireAuth";

const router = Router();

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
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
 *             required: [body]
 *             properties:
 *               body:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 *       403:
 *         description: Forbidden
 */
router.post("/:workspaceId/tasks/:taskId/comments", authMiddleware, validate(CommentInput), requireRole("OWNER", "ADMIN", "MEMBER"), createCommentHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}/comments:
 *   get:
 *     summary: List all comments on a task
 *     tags: [Comments]
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
 *         description: List of comments
 *       403:
 *         description: Forbidden
 */
router.get("/:workspaceId/tasks/:taskId/comments", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER", "VIEWER"), getCommentHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
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
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Comment not found
 */
router.delete("/:workspaceId/tasks/:taskId/comments/:commentId", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER"), deleteCommentHandler)

export default router;