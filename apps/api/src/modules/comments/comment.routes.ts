import { Router } from "express";
import { requireRole } from "@/middleware/requireRole";
import { validate } from "@/middleware/validate";
import { 
    createCommentHandler, 
    getCommentHandler,
    deleteCommentHandler 
} from "./comment.controller";
import { CommentInput } from "./comment.schema";
import { authMiddleware } from "@/middleware/requireAuth";

const router = Router();

router.post("/:workspaceId/tasks/:taskId/comments", authMiddleware, validate(CommentInput), requireRole("OWNER", "ADMIN", "MEMBER"), createCommentHandler)

router.get("/:workspaceId/tasks/:taskId/comments", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER", "VIEWER"), getCommentHandler)

router.delete("/:workspaceId/tasks/:taskId/comments/:commentId", authMiddleware, requireRole("OWNER", "ADMIN", "MEMBER"), deleteCommentHandler)


export default router;