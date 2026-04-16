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

    // NOTE: Do not add a NODE_ENV-based authentication bypass here. A
    // fail-open bypass (e.g. `if (NODE_ENV === 'development') req.user = ...`)
    // is a critical auth vulnerability because it makes every protected
    // route publicly accessible any time NODE_ENV is unset or misconfigured
    // (e.g. container starts without NODE_ENV). If you need a stubbed
    // local-only auth mode, gate it behind an explicit boolean env var that
    // MUST NOT be set in any non-local environment, and still require a
    // Bearer token shape to reach it.

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
