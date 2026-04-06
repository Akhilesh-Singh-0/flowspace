import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { logger } from '@/lib/logger'

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const requestId = req.headers['x-request-id']

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of err.issues) {
      const key = issue.path.join('.')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return res.status(400).json({
      success: false,
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: fieldErrors },
      requestId,
    })
  }

  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      data: null,
      error: { code: 'CONFLICT', message: 'Resource already exists' },
      requestId,
    })
  }

  logger.error('Unhandled error', {
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
    requestId,
  })

  return res.status(500).json({
    success: false,
    data: null,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong' },
    requestId,
  })
}