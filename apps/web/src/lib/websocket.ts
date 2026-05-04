type WSEventType = 'task.created' | 'task.updated' | 'task.deleted'

type WSMessage =
  | { type: 'task.created'; workspaceId: string; task: unknown }
  | { type: 'task.updated'; workspaceId: string; task: unknown }
  | { type: 'task.deleted'; workspaceId: string; taskId: string }

type WSListener = (message: WSMessage) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private workspaceId: string | null = null
  private listeners: Set<WSListener> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private shouldReconnect = false

  connect(workspaceId: string) {
    
    if (
      this.ws &&
      this.ws.readyState === WebSocket.OPEN &&
      this.workspaceId === workspaceId
    ) return

    this.workspaceId = workspaceId
    this.shouldReconnect = true
    this.openSocket()
  }

  private openSocket() {
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
    }

    const ws = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'
    )
    this.ws = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', workspaceId: this.workspaceId }))
    }

    ws.onmessage = (event: MessageEvent) => {
        try {
          const raw = JSON.parse(event.data as string) as { type: string }
          if (raw.type === 'joined') return // ignore join ack
          this.listeners.forEach((fn) => fn(raw as WSMessage))
        } catch {
          
        }
      }

    ws.onclose = () => {
      if (this.shouldReconnect) {
        this.reconnectTimer = setTimeout(() => this.openSocket(), 3000)
      }
    }

    ws.onerror = () => {
      ws.close()
    }
  }

  disconnect() {
    this.shouldReconnect = false
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
    this.workspaceId = null
  }

  addListener(fn: WSListener) {
    this.listeners.add(fn)
  }

  removeListener(fn: WSListener) {
    this.listeners.delete(fn)
  }
}

export const wsClient = new WebSocketClient()
export type { WSMessage, WSEventType }