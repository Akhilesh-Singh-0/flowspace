import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from '@/lib/swagger'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestId } from '@/middleware/requestId'
import { errorHandler } from '@/middleware/errorHandler'
import workspaceRoutes from "@/modules/workspaces/workspace.routes"
import projectRoutes from "@/modules/projects/project.routes"
import webhookRoute from "@/modules/auth/auth.routes"
import taskRoutes from "@/modules/tasks/task.routes"
import commentRoutes from "@/modules/comments/comment.routes"
import lableRoutes from '@/modules/labels/label.routes'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { generalLimiter, authLimiter } from '@/middleware/rateLimiter'

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(generalLimiter)
  app.use('/auth/webhook', express.raw({ type: 'application/json' }))
  app.use(express.json())
  app.use(requestId)

  app.use('/auth', authLimiter)
  app.use("/auth", webhookRoute)
  app.use("/workspaces", workspaceRoutes)
  app.use("/workspaces", projectRoutes)
  app.use("/workspaces", taskRoutes)
  app.use("/workspaces", commentRoutes)
  app.use("/workspaces", lableRoutes)

  app.get('/health', async (req, res) => {
    type Status = 'ok' | 'error'
    const health = {
      server: 'ok' as Status,
      database: 'ok' as Status,
      redis: 'ok' as Status,
      port: env.PORT,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }
    const withTimeout = <T>(promise: Promise<T>, ms: number) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), ms)
        ),
      ])
    const [dbResult, redisResult] = await Promise.allSettled([
      withTimeout(prisma.$queryRaw`SELECT 1`, 2000),
      withTimeout(redis.ping(), 2000),
    ])
    if (dbResult.status === 'rejected') {
      health.database = 'error'
      logger.error('Health check DB failed', { error: dbResult.reason })
    }
    if (redisResult.status === 'rejected') {
      health.redis = 'error'
      logger.error('Health check Redis failed', { error: redisResult.reason })
    }
    const isHealthy = health.database === 'ok' && health.redis === 'ok'
    return res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'ok' : 'error',
      services: {
        database: health.database,
        redis: health.redis,
      },
      meta: {
        uptime: health.uptime,
        timestamp: health.timestamp,
        port: health.port,
      },
    })
  })

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.use(errorHandler)

  return app
}