import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { requestId } from '@/middleware/requestId'
import { errorHandler } from '@/middleware/errorHandler'
import workspaceRoutes from "@/modules/workspaces/workspace.routes";
import projectRoutes from "@/modules/projects/project.routes"
import webhookRoute from "@/modules/auth/auth.routes"
import taskRoutes from "@/modules/tasks/task.routes"
import commentRoutes from "@/modules/comments/comment.routes"
import lableRoutes from '@/modules/labels/label.routes'

export const createApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use('/auth/webhook', express.raw({ type: 'application/json' }))
  app.use(express.json())
  app.use(requestId)

  app.use("/auth", webhookRoute)
  app.use("/workspaces", workspaceRoutes)
  app.use("/workspaces", projectRoutes)
  app.use("/workspaces", taskRoutes)
  app.use("/workspaces", commentRoutes)
  app.use("/workspaces", lableRoutes)
  app.use(errorHandler)
  
  return app
}