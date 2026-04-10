import { Router } from 'express'
import { createWorkspaceHandler, getWorkspaceHandler, addWorkspaceMemberHandler, getWorkspaceMembersHandler } from './workspace.controller'
import { WorkspaceInput, addMember } from './workspace.schema'
import { validate } from '@/middleware/validate'
import {authMiddleware} from "@/middleware/requireAuth"

const router = Router()

router.post('/',authMiddleware, validate(WorkspaceInput), createWorkspaceHandler);

router.get("/", authMiddleware, getWorkspaceHandler); 

router.post("/:id/members", authMiddleware, validate(addMember), addWorkspaceMemberHandler);

router.get("/:id/members", authMiddleware, getWorkspaceMembersHandler);

export default router