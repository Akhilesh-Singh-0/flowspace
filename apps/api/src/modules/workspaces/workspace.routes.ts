import { Router } from 'express'
import { createWorkspaceHandler, getWorkspaceHandler } from './workspace.controller'
import { WorkspaceInput } from './workspace.schema'
import { validate } from '@/middleware/validate'
import {authMiddleware} from "@/middleware/requireAuth"

const router = Router()

router.post('/',authMiddleware, validate(WorkspaceInput), createWorkspaceHandler);

router.get("/", authMiddleware, getWorkspaceHandler); 

export default router