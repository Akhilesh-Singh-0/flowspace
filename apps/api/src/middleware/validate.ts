import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodTypeAny) => 
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (error) {
      next(error);
    }
};