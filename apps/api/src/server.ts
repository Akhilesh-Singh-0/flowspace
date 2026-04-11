import { createApp } from '@/app'
import { env } from '@/config/env'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

const app = createApp()

const server = app.listen(env.PORT, () => {
  logger.info('FlowSpace API running', { port: env.PORT })
})

const shutdown = async () => {
  logger.info('Shutting down gracefully...')
  server.close()
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)