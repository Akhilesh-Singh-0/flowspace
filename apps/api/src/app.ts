import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestId } from '@/middleware/requestId'
import { errorHandler } from '@/middleware/errorHandler'

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(requestId)

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })

  app.use(errorHandler)

  return app
}