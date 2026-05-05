import { createApp } from '@/app'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { createWebSocketServer } from '@/lib/websocket'
import { notificationWorker } from '@/lib/notification.worker'

const app = createApp()

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, '0.0.0.0', () => {
  logger.info('FlowSpace API running', { port })
  createWebSocketServer(server)
  logger.info('WebSocket server started')
})

const shutdown = async () => {
  logger.info('Shutting down...')
  server.close()
  await notificationWorker.close()
  await prisma.$disconnect()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)