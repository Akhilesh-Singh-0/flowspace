import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    
    if (process.env.NODE_ENV === "development") {
      req.user = { userId: "test-user-1" };
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid token",
        },
      });
    }

    const token = authHeader.split(" ")[1];

    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    req.user = { userId: verified.sub };

    next();
  } catch (error: any) {
    
    if (error.message?.includes("JWT is expired")) {
      return res.status(401).json({
        success: false,
        data: null,
        error: {
          code: "TOKEN_EXPIRED",
          message: "Session expired, please login again",
        },
      });
    }

    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid token",
      },
    });
  }
};