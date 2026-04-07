import { Request, Response, NextFunction } from "express";
import { Webhook } from "svix";
import { syncClerkUser } from "./auth.service";

export const clerkWebhookHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

      const payload = wh.verify(req.body, {
        "svix-id": req.headers["svix-id"] as string,
        "svix-timestamp": req.headers["svix-timestamp"] as string,
        "svix-signature": req.headers["svix-signature"] as string,
      }) as { type: string; data: any };

      if(payload.type === "user.created"){

        const clerkId = payload.data.id;

        const email = payload.data.email_addresses?.[0]?.email_address ?? "";

        const name = `${payload.data.first_name} ${payload.data.last_name}`;
        
        const user = await syncClerkUser({ clerkId, email, name });
        
        return res.status(200).json({
          success: true,
          data: user
        });
      }

      return res.status(200).json({ success: true });

    } catch (error) {
      next(error)
    }
}