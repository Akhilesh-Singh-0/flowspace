# Pub/Sub and Queue Infrastructure

## Overview

The API uses Redis for two distinct asynchronous concerns, each exposed through its own small module:

1. **Real-time fan-out (pub/sub)** — broadcasting workspace events (e.g. `task.created`) to every connected WebSocket client. Messages are ephemeral; any client that is not connected when the message is published will miss it.
2. **Durable background jobs (BullMQ)** — queueing work that must be retried and survive process restarts (e.g. sending notifications when a task is assigned).

Both modules share the same `REDIS_URL` and depend on the base `ioredis` client exported from `@/lib/redis`. They are documented together because they are conventionally used as a pair by the task module.

**Sources**

- [`apps/api/src/lib/redis.ts`](../../apps/api/src/lib/redis.ts)
- [`apps/api/src/lib/pubsub.ts`](../../apps/api/src/lib/pubsub.ts)
- [`apps/api/src/lib/queue.ts`](../../apps/api/src/lib/queue.ts)

---

## `@/lib/redis` — Base Client

A single shared `ioredis` client, used directly by BullMQ (via `@/lib/queue`) and indirectly by `@/lib/pubsub` (which creates its own dedicated publisher/subscriber connections rather than reusing this one).

### Exports

#### `redis: Redis`

```ts
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})
```

- `maxRetriesPerRequest: null` — required by BullMQ so commands do not time out during reconnection windows.
- `enableReadyCheck: false` — disables the client-side ready check; BullMQ handles its own readiness semantics.

### Events

| Event     | Handler                                                    |
| --------- | ---------------------------------------------------------- |
| `connect` | `logger.info('Redis connected')`                           |
| `error`   | `logger.error('Redis error', { err })`                     |

---

## `@/lib/pubsub` — Publish/Subscribe

Provides a minimal pub/sub helper layered on top of ioredis. Uses **two dedicated connections** (publisher and subscriber) because ioredis forbids issuing regular commands on a connection that has entered subscriber mode.

Both connections are configured with the same `maxRetriesPerRequest: null` / `enableReadyCheck: false` options as the base client.

### Internal State

A module-level handler map is kept so multiple in-process subscribers on the same channel share a single `subscriber.subscribe(channel)` call:

```ts
const handlers: Map<string, Set<(message: unknown) => void>> = new Map()
```

Incoming messages are parsed as JSON once and dispatched to every callback in the set. Parse failures are logged (`'Invalid JSON message'`) and the message is dropped.

### Exports

#### `publish(channel, message)`

```ts
export const publish = async (
  channel: string,
  message: unknown,
) => Promise<void>
```

- `channel` — the Redis pub/sub channel name.
- `message` — any JSON-serialisable value. The helper `JSON.stringify`s it before publishing.

#### `subscribe(channel, callback)`

```ts
export const subscribe = async (
  channel: string,
  callback: (message: unknown) => void,
) => Promise<() => Promise<void>>
```

Registers `callback` for the given channel and returns an **async unsubscribe function**. When the last handler for a channel unsubscribes, the underlying `subscriber.unsubscribe(channel)` is issued and the channel entry is removed from the map.

**Example**

```ts
import { subscribe, publish } from '@/lib/pubsub'

const unsubscribe = await subscribe('workspace-events', (event) => {
  console.log('received', event)
})

await publish('workspace-events', { type: 'task.created', workspaceId: 'ws_1', task: { /* ... */ } })

// later
await unsubscribe()
```

### Connection Events

Each connection logs its own connect/error lifecycle:

- `publisher`: `'Redis Publisher connected'` / `'Redis Publisher Error'`
- `subscriber`: `'Redis Subscriber connected'` / `'Redis Subscriber Error'`

### Channel Inventory

Only one channel is used today:

| Channel             | Event types                                             | Publisher                       | Consumer                                              |
| ------------------- | ------------------------------------------------------- | ------------------------------- | ----------------------------------------------------- |
| `workspace-events`  | `task.created`, `task.updated`, `task.deleted`          | `task.service` (on write paths) | `createWebSocketServer` (broadcasts to joined rooms)  |

Event payloads carry at least `{ type, workspaceId }` plus `task` (or `taskId` for deletes). The WebSocket server filters by `workspaceId` and only forwards to clients that have joined the matching room.

---

## `@/lib/queue` — BullMQ Notification Queue

A single BullMQ queue named `notifications` for durable background work. Currently only one job type is defined; the design leaves room to add more (e.g. `COMMENT_MENTIONED`) without extra infrastructure.

### Exports

#### `NotificationJob` type

```ts
export type NotificationJob = {
  type: 'TASK_ASSIGNED'
  workspaceId: string
  userId: string
  taskId: string
}
```

This is the strict payload type for every job in the `notifications` queue. The literal `type` field doubles as the BullMQ job name, which is how the worker routes jobs to the right handler.

#### `notificationQueue: Queue<NotificationJob>`

```ts
export const notificationQueue = new Queue<NotificationJob>('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    removeOnFail: 1000,
  },
})
```

- **`attempts: 3`** — failed jobs are retried up to three times.
- **`backoff: exponential`, `delay: 1000`** — 1s → 2s → 4s spacing between retries.
- **`removeOnComplete: true`** — successful jobs are removed immediately to keep Redis memory bounded.
- **`removeOnFail: 1000`** — only the most recent 1000 failed jobs are retained for inspection.

#### `addNotificationJob(data)`

```ts
export const addNotificationJob = async (
  data: NotificationJob,
) => Promise<void>
```

Enqueues a job with a **deduplicating `jobId`** of the form `${type}:${taskId}:${userId}`. BullMQ refuses to add a job with a duplicate `jobId`, so re-submitting the same assignment (e.g. if the service layer retries) is a safe no-op. A successful enqueue is logged via Winston with `type`, `taskId`, and `userId`.

### Queue Events

| Event   | Handler                                                |
| ------- | ------------------------------------------------------ |
| `error` | `logger.error('Notification queue error', { err })`    |

---

## Consumers

- [`@/lib/websocket`](./websocket.md) subscribes to `workspace-events` inside `createWebSocketServer` and forwards each event to the matching per-workspace room.
- [`@/lib/notification.worker`](./notification-worker-and-logger.md) consumes the `notifications` queue. It is started from `server.ts` and shut down on `SIGTERM`/`SIGINT`.
- [`task.service`](../services/task.service.md) is the only current publisher of `workspace-events` and caller of `addNotificationJob`.

## Cross-References

- [`docs/lib/websocket.md`](./websocket.md)
- [`docs/lib/notification-worker-and-logger.md`](./notification-worker-and-logger.md)
- [`docs/services/task.service.md`](../services/task.service.md)
- [`docs/modules-overview.md`](../modules-overview.md)
