import { Router } from 'express'
import {
  createWorkspaceHandler,
  getWorkspaceHandler,
  addWorkspaceMemberHandler,
  getWorkspaceMembersHandler,
  removeWorkspaceMemberHandler
} from './workspace.controller'

import {
  WorkspaceInput,
  addMember,
  removeMemberParams
} from './workspace.schema'

import { validate } from '@/middleware/validate'
import { authMiddleware } from "@/middleware/requireAuth"

const router = Router()

router.post(
  '/',
  authMiddleware,
  validate(WorkspaceInput),
  createWorkspaceHandler
)

router.get(
  '/',
  authMiddleware,
  getWorkspaceHandler
)

router.post(
  "/:workspaceId/members",
  authMiddleware,
  validate(addMember),
  addWorkspaceMemberHandler
)

router.get(
  "/:workspaceId/members",
  authMiddleware,
  getWorkspaceMembersHandler
)

router.delete(
  "/:workspaceId/members/:userId",
  authMiddleware,
  validate(removeMemberParams),
  removeWorkspaceMemberHandler
)

export default router