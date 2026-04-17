import { Router } from "express";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { createCommentHandler } from "./comment.controller";
import { CommentInput } from "./comment.schema";
import { authMiddleware } from "@/middleware/requireAuth";

const router = Router();

router.post("/:workspaceId/tasks/:taskId/comments", authMiddleware, validate(CommentInput), requireRole("OWNER", "ADMIN", "MEMBER"), createCommentHandler)

export default router;