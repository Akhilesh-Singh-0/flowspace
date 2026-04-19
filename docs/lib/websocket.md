# WebSocket Server

## Overview

`@/lib/websocket` attaches a [`ws`](https://github.com/websockets/ws) `WebSocketServer` to the existing HTTP server (so it runs on the same port as the Express app) and wires it to the Redis pub/sub channel `workspace-events`. Every write that the task service publishes is forwarded here and broadcast to every connected client that has joined the matching workspace room.

**Source:** [`apps/api/src/lib/websocket.ts`](../../apps/api/src/lib/websocket.ts)

## Architecture

```
task.service.ts
    │
    │ publish('workspace-events', { type, workspaceId, ... })
    ▼
Redis pub/sub (workspace-events)
    │
    │ subscribe('workspace-events', ...)
    ▼
createWebSocketServer
    │
    │ broadcastToWorkspace(workspaceId, event)
    ▼
ws clients that sent { type: 'join', workspaceId }
```

Rooms are kept in an in-process `Map<workspaceId, Set<AliveWebSocket>>`. Because the map is per-process, **horizontal scaling across multiple API instances will not currently fan out messages between instances**. Moving the room registry to a shared store (e.g. Redis sets) is a known future work item.

## Internal Types

```ts
interface AliveWebSocket extends WebSocket {
  isAlive: boolean
}
```

Used by the heartbeat loop to detect and terminate clients that stop responding to pings.

## Exports

### `createWebSocketServer(server)`

Constructs the WebSocket server, wires it into pub/sub, installs a heartbeat loop, and returns the `WebSocketServer` instance.

```ts
export const createWebSocketServer = (
  server: http.Server,
) => WebSocketServer
```

**Parameters** — `server`: the Node `http.Server` returned by `app.listen(...)`. Upgrading on the same server means WebSocket traffic flows through the same port as HTTP.

**Returns** — the configured `WebSocketServer`. Callers typically do not need to hold the return value.

**Side effects set up inside**

1. **`subscribe('workspace-events', ...)`** — on every event, if it is an object with a `workspaceId` property, `broadcastToWorkspace(workspaceId, event)` is invoked.
2. **`connection` handler** — awaits a `{ type: 'join', workspaceId: string }` message, registers the socket under that workspace in the rooms map, and replies with `{ type: 'joined', workspaceId }`. Other message shapes are logged as invalid.
3. **`pong` handler** — marks the socket `isAlive = true` so the next heartbeat cycle knows not to terminate it.
4. **Heartbeat** — `setInterval(..., 30000)` iterates `wss.clients`. Clients whose `isAlive` is still `false` from the previous cycle are terminated (`client.terminate()`); all others have `isAlive` reset to `false` and are sent a `ping`.
5. **`close` (per client)** — removes the client from every room it appears in; if a room becomes empty, the room entry is deleted.
6. **`close` (server)** — clears the heartbeat interval.

### `broadcastToWorkspace(workspaceId, event)`

Sends a JSON-stringified event to every `OPEN` client in the room.

```ts
export const broadcastToWorkspace = (
  workspaceId: string,
  event: unknown,
) => void
```

**Behaviour**

- Looks up the room set for `workspaceId`. Returns silently if the room does not exist.
- Serialises `event` with `JSON.stringify`.
- For each client in the room whose `readyState === WebSocket.OPEN`, calls `client.send(message)`.
- Closing, closed, or connecting clients are skipped (not removed — that happens in the per-client `close` handler).

## Protocol

The client protocol is intentionally minimal:

**Client → Server (join a workspace room)**

```json
{ "type": "join", "workspaceId": "ws_abc" }
```

**Server → Client (acknowledgement)**

```json
{ "type": "joined", "workspaceId": "ws_abc" }
```

**Server → Client (workspace events, verbatim from `workspace-events` pub/sub)**

Today these come from `task.service` on create/update/delete:

```json
{ "type": "task.created",  "workspaceId": "ws_abc", "task": { /* full task */ } }
{ "type": "task.updated",  "workspaceId": "ws_abc", "task": { /* full task */ } }
{ "type": "task.deleted",  "workspaceId": "ws_abc", "taskId": "task_xyz" }
```

Clients receive raw pub/sub payloads with no additional wrapping. There is no per-message acknowledgement.

## Limitations

- **In-process rooms only.** As noted above, the room registry is a plain `Map` local to the process. Running more than one API replica requires a shared room registry (e.g. Redis sets) or sticky routing; neither is implemented today.
- **No authentication on the socket.** The current `connection` handler trusts the `workspaceId` the client advertises in `{ type: 'join' }`. Role-based access control on the socket is a future-work item.
- **No subscription filtering on the server.** Clients in a workspace room receive every `workspace-events` payload for that workspace, regardless of whether they would pass authorization on the underlying task.

## Cross-References

- [`docs/lib/pubsub-and-queue.md`](./pubsub-and-queue.md) — the pub/sub channel this file subscribes to.
- [`docs/services/task.service.md`](../services/task.service.md) — the only current publisher.
- [`docs/modules-overview.md`](../modules-overview.md)
