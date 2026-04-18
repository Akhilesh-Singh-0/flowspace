import { WebSocketServer, WebSocket } from "ws"
import { Server } from "http"
import { subscribe } from "@/lib/pubsub"
import { logger } from "@/lib/logger"

interface AliveWebSocket extends WebSocket {
  isAlive: boolean
}

const rooms = new Map<string, Set<AliveWebSocket>>()

export const createWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server })

  subscribe("workspace-events", (event: unknown) => {
    if (
      typeof event === "object" &&
      event !== null &&
      "workspaceId" in event
    ) {
      const { workspaceId } = event as { workspaceId: string }
      broadcastToWorkspace(workspaceId, event)
    }
  })

  wss.on("connection", (ws: WebSocket) => {
    const client = ws as AliveWebSocket
    client.isAlive = true

    logger.info("New WebSocket connection")

    client.on("pong", () => {
      client.isAlive = true
    })

    client.on("message", (message: string) => {
      try {
        const data = JSON.parse(message.toString())

        if (
          data?.type === "join" &&
          typeof data.workspaceId === "string"
        ) {
          const { workspaceId } = data

          if (!rooms.has(workspaceId)) {
            rooms.set(workspaceId, new Set())
          }

          rooms.get(workspaceId)!.add(client)

          logger.info(`Client joined workspace: ${workspaceId}`)

          client.send(
            JSON.stringify({ type: "joined", workspaceId })
          )
        }
      } catch (error) {
        logger.error("Invalid WebSocket message", { error })
      }
    })

    client.on("close", () => {

      rooms.forEach((clients, workspaceId) => {
        clients.delete(client)
        if (clients.size === 0) {
          rooms.delete(workspaceId)
        }
      })

      logger.info("Client disconnected")
    })
  })

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = ws as AliveWebSocket

      if (!client.isAlive) {
        logger.info("Terminating dead connection")
        return client.terminate()
      }

      client.isAlive = false
      client.ping()
    })
  }, 30000)

  wss.on("close", () => {
    clearInterval(interval)
  })

  return wss
}

export const broadcastToWorkspace = (
  workspaceId: string,
  event: unknown
) => {
  const clients = rooms.get(workspaceId)
  if (!clients) return

  const message = JSON.stringify(event)

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message)
    }
  })
}