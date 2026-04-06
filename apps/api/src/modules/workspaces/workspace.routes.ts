import { Router } from 'express'
import { createWorkspaceHandler, getWorkspaceHandler } from './workspace.controller'
import { WorkspaceInput } from './workspace.schema'
import { validate } from '@/middleware/validate'

const router = Router()

router.post('/', validate(WorkspaceInput), createWorkspaceHandler);

router.get("/", getWorkspaceHandler); 

export default router