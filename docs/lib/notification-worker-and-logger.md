# Notification Worker and Logger

## Overview

Two tightly-coupled infrastructure utilities:

- **`notification.worker`** — the BullMQ consumer for the `notifications` queue. It currently only handles `TASK_ASSIGNED` jobs and logs them; the integration points for email/push delivery are intentional placeholders.
- **`logger`** — the Winston logger used by every other module in `apps/api/src/`. It is the sole source of structured log output; no `console.*` calls should appear in production code.

They are documented together because the worker's entire observable behaviour today flows through the logger.

**Sources**

- [`apps/api/src/lib/notification.worker.ts`](../../apps/api/src/lib/notification.worker.ts)
- [`apps/api/src/lib/logger.ts`](../../apps/api/src/lib/logger.ts)

---

## `@/lib/notification.worker`

### Exports

#### `notificationWorker: Worker<NotificationJob>`

```ts
export const notificationWorker = new Worker<NotificationJob>(
  'notifications',
  async (job) => { /* ... */ },
  {
    connection: redis,
    concurrency: 5,
    lockDuration: 30000,
  },
)
```

- **Queue name:** `notifications` (matches `@/lib/queue`).
- **Connection:** the shared `redis` client from `@/lib/redis`.
- **`concurrency: 5`** — up to 5 jobs are processed in parallel per worker instance.
- **`lockDuration: 30000`** — a job lock is renewed for 30 s; a worker that dies without renewing loses the lock and the job is picked up by another worker after that window.

### Processor Behaviour

The processor switches on `job.name` (which is the `NotificationJob.type` literal):

| `job.name`       | Behaviour                                                                 |
| ---------------- | ------------------------------------------------------------------------- |
| `TASK_ASSIGNED`  | Logs `'Task assigned notification'` with `{ taskId, userId, workspaceId }`. No external side effects yet — this is the integration point for email / push delivery once those providers are added. |
| anything else    | Throws `new Error('Unhandled job type: …')`, which causes BullMQ to count the attempt as a failure and retry per the queue's default job options. |

### Lifecycle Events

| Event       | Handler                                                      |
| ----------- | ------------------------------------------------------------ |
| `completed` | `logger.info('Notification job completed', { jobId, type })` |
| `failed`    | `logger.error('Notification job failed', { jobId, type, err })` |
| `error`     | `logger.error('Notification worker error', { err })`         |

### Startup / Shutdown

The worker is started from `server.ts` (its import is sufficient — instantiating a `Worker` starts it consuming jobs) and is gracefully closed on `SIGTERM` / `SIGINT` before the HTTP server is closed. See `apps/api/src/server.ts` for the shutdown sequence.

---

## `@/lib/logger`

A single Winston logger configured for the application.

### Exports

#### `logger`

```ts
export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
  ),
  transports: [new winston.transports.Console()],
})
```

### Behaviour

- **Log level** — `'warn'` in production (so `info`/`debug` calls are dropped), `'debug'` everywhere else.
- **Format chain** —
  1. `timestamp()` adds an ISO 8601 timestamp to every entry.
  2. `errors({ stack: true })` expands `Error` instances (for example those passed via `{ err }`) so their `stack` is logged instead of `[object Object]`.
  3. In production: `json()` — one JSON object per line, suitable for log aggregation pipelines.
  4. Otherwise: `colorize() + simple()` — readable coloured output for local development.
- **Transports** — `Console` only. No file transport, no external sink; production deployments are expected to capture stdout/stderr via the container runtime.

### Usage Convention

The codebase consistently passes a **string message plus an object of structured fields**:

```ts
logger.info('Redis connected')
logger.info('Notification job added', { type: data.type, taskId: data.taskId, userId: data.userId })
logger.error('Redis Publisher Error', { err })
logger.error('Unhandled error', { message, stack, requestId })
```

New code should follow the same convention so production JSON output stays parseable.

## Cross-References

- [`docs/lib/pubsub-and-queue.md`](./pubsub-and-queue.md) — the queue this worker consumes from.
- [`docs/lib/websocket.md`](./websocket.md) — uses the same logger for connection events.
- [`docs/modules-overview.md`](../modules-overview.md)
