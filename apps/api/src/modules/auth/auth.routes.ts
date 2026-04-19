import { Router } from "express";
import { clerkWebhookHandler } from "./auth.controller";

const router = Router()

/**
 * @swagger
 * /auth/webhook:
 *   post:
 *     summary: Clerk webhook — syncs new users to database
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User synced
 *       400:
 *         description: Invalid webhook signature
 *       429: 
 *         description: Too Many Requests
 * description: Clerk webhook — syncs new users to database. Triggered by Clerk only, not for direct use.
 */
router.post("/webhook", clerkWebhookHandler);

export default router;