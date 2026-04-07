import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

interface AuthRequest extends Request {
    user?: {
      userId: string;
    };
  }

export const authMiddleware =async (req: AuthRequest, res: Response,  next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer")){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }

        const token = authHeader.split(" ")[1];

        const verified = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY!
        });

        if(!verified){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        
        req.user = { userId: verified.sub };

        next();

    } catch (error) {
        next(error);
    }
}