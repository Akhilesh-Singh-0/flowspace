import express from 'express'
import cors, { CorsOptions } from 'cors'
import helmet from 'helmet'
import { env } from '@/config/env'
import { requestId } from '@/middleware/requestId'
import { errorHandler } from '@/middleware/errorHandler'
import workspaceRoutes from "@/modules/workspaces/workspace.routes";
import projectRoutes from "@/modules/projects/project.routes"
import webhookRoute from "@/modules/auth/auth.routes"
import taskRoutes from "@/modules/tasks/task.routes"

const buildCorsOptions = (): CorsOptions => {
  const raw = env.CORS_ALLOWED_ORIGINS
  const allowList = raw
    ? raw.split(',').map((o) => o.trim()).filter(Boolean)
    : []

  return {
    origin: (origin, callback) => {
      // Same-origin / non-browser (curl, server-to-server) requests have no Origin header.
      if (!origin) return callback(null, true)
      if (allowList.includes(origin)) return callback(null, true)
      return callback(new Error(`Origin ${origin} not allowed by CORS`))
    },
    credentials: true,
  }
}

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors(buildCorsOptions()))
  app.use('/auth/webhook', express.raw({ type: 'application/json' }))
  app.use(express.json())
  app.use(requestId)

  app.use("/auth", webhookRoute)
  app.use("/workspaces", workspaceRoutes)
  app.use("/workspaces", projectRoutes)
  app.use("/workspaces", taskRoutes)
  app.use(errorHandler)
  
  return app
}
