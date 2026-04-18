import { Worker } from "bullmq"
import { redis } from "@/lib/redis"
import { logger } from "@/lib/logger"
import { NotificationJob } from "@/lib/queue"

export const notificationWorker = new Worker<NotificationJob>(
  "notifications",
  async (job) => {
    logger.info("Processing notification job", {
      jobId: job.id,
      type: job.name,
    })

    switch (job.name) {
      case "TASK_ASSIGNED": {
        const { taskId, userId, workspaceId } = job.data

        logger.info("Task assigned notification", {
          taskId,
          userId,
          workspaceId,
        })

        break
      }

      default:
        throw new Error(`Unhandled job type: ${job.name}`)
    }
  },
  {
    connection: redis,
    concurrency: 5,
    lockDuration: 30000,
  }
)

notificationWorker.on("completed", (job) => {
  logger.info("Notification job completed", {
    jobId: job.id,
    type: job.name,
  })
})

notificationWorker.on("failed", (job, err) => {
  logger.error("Notification job failed", {
    jobId: job?.id,
    type: job?.name,
    err,
  })
})

notificationWorker.on("error", (err) => {
  logger.error("Notification worker error", { err })
})