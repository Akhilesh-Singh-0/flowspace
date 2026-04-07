import { Router } from "express";
import { clerkWebhookHandler } from "./auth.controller";

const router = Router()

router.post("/webhook", clerkWebhookHandler);

export default router;