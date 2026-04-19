import rateLimit from "express-rate-limit"
import { RedisStore } from "rate-limit-redis"
import { redis } from "@/lib/redis"

const createLimiter = (max: number, message: string) =>
  rateLimit({
    windowMs: 60 * 1000,
    max,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message,
      },
    },

    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]) =>
        redis.call(command, ...args) as Promise<any>,
    }),

})

export const generalLimiter = createLimiter(
  100,
  "Too many requests"
)

export const authLimiter = createLimiter(
  10,
  "Too many auth attempts"
)