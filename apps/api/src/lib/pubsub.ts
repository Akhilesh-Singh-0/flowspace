import Redis from "ioredis"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"

const publisher = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

const subscriber = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

const handlers: Map<string, Set<(message: unknown) => void>> = new Map()

subscriber.on("message", (channel, message) => {
  const callbacks = handlers.get(channel)
  if (!callbacks) return
  let parsed: unknown
  try {
    parsed = JSON.parse(message)
  } catch (err) {
    logger.error("Invalid JSON message", { message })
    return
  }
  callbacks.forEach((cb) => cb(parsed))
})

publisher.on("connect", () => logger.info("Redis Publisher connected"))
subscriber.on("connect", () => logger.info("Redis Subscriber connected"))
publisher.on("error", (err) => logger.error("Redis Publisher Error", { err }))
subscriber.on("error", (err) => logger.error("Redis Subscriber Error", { err }))

export const publish = async (channel: string, message: unknown) => {
  await publisher.publish(channel, JSON.stringify(message))
}

export const subscribe = async (
  channel: string,
  callback: (message: unknown) => void
) => {
  if (!handlers.has(channel)) {
    handlers.set(channel, new Set())
    await subscriber.subscribe(channel)
  }
  handlers.get(channel)!.add(callback)

  return async () => {
    const set = handlers.get(channel)
    if (!set) return
    set.delete(callback)
    if (set.size === 0) {
      handlers.delete(channel)
      await subscriber.unsubscribe(channel)
    }
  }
}