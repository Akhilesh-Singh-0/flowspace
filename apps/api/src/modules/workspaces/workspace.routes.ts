import { Router } from 'express'
import {
  createWorkspaceHandler,
  getWorkspaceHandler,
  addWorkspaceMemberHandler,
  getWorkspaceMembersHandler,
  removeWorkspaceMemberHandler
} from './workspace.controller'
import { WorkspaceInput, addMember } from './workspace.schema'
import { validate } from '@/middleware/validate'
import { authMiddleware } from "@/middleware/requireAuth"

const router = Router()

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', authMiddleware, validate(WorkspaceInput), createWorkspaceHandler)

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get all workspaces for the current user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 *       401:
 *         description: Unauthorized
 */
router.get('/', authMiddleware, getWorkspaceHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/members:
 *   post:
 *     summary: Add a member to a workspace
 *     tags: [Workspaces]
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
 *             required: [targetUserId, role]
 *             properties:
 *               targetUserId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, VIEWER]
 *     responses:
 *       201:
 *         description: Member added
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       409:
 *         description: Already a member
 */
router.post("/:workspaceId/members", authMiddleware, validate(addMember), addWorkspaceMemberHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/members:
 *   get:
 *     summary: List all members of a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of members
 *       403:
 *         description: Forbidden
 */
router.get("/:workspaceId/members", authMiddleware, getWorkspaceMembersHandler)

/**
 * @swagger
 * /workspaces/{workspaceId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Member not found
 */
router.delete("/:workspaceId/members/:userId", authMiddleware, removeWorkspaceMemberHandler)

export default router