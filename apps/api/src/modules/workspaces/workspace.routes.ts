import  { Router } from "express";
import { createWorkspaceHandler } from "./workspace.controller";
import { WorkspaceInput } from "./workspace.schema";
import { validate } from "@/middleware/validate";

const router = Router()

router.post("/", validate(WorkspaceInput), createWorkspaceHandler);

export default router;