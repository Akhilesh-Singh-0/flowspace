import { Queue } from "bullmq"
import { redis } from "@/lib/redis"
import { logger } from "@/lib/logger"

export type NotificationJob = {
  type: "TASK_ASSIGNED"
  workspaceId: string
  userId: string
  taskId: string
}

export const notificationQueue = new Queue<NotificationJob>("notifications", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
})

export const addNotificationJob = async (data: NotificationJob) => {
  await notificationQueue.add(data.type, data, {
    jobId: `${data.type}:${data.taskId}:${data.userId}`,
  })
  logger.info("Notification job added", {
    type: data.type,
    taskId: data.taskId,
    userId: data.userId,
  })
}

notificationQueue.on("error", (err) => {
  logger.error("Notification queue error", { err })
})