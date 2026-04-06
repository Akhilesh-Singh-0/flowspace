import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestId } from '@/middleware/requestId'
import { errorHandler } from '@/middleware/errorHandler'
import workspaceRoutes from "@/modules/workspaces/workspace.routes";

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(requestId)

  app.use("/workspaces", workspaceRoutes)
  
  app.use(errorHandler)
  
  return app
}