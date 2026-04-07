import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestId } from '@/middleware/requestId'
import { errorHandler } from '@/middleware/errorHandler'
import workspaceRoutes from "@/modules/workspaces/workspace.routes";
import webhookRoute from "@/modules/auth/auth.routes"

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use('/auth/webhook', express.raw({ type: 'application/json' }))
  app.use(express.json())
  app.use(requestId)

  app.use("/auth", webhookRoute)
  app.use("/workspaces", workspaceRoutes)
  
  app.use(errorHandler)
  
  return app
}