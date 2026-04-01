import { Request, Response, NextFunction } from 'express'
import { logger } from '@/lib/logger'
import { ZodError } from 'zod/v3'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqId = req.headers['x-request-id']

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.flatten().fieldErrors,
      requestId: reqId,
    })
  }

  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    requestId: reqId,
  })

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    requestId: reqId,
  })
}