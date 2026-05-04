'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { wsClient } from '@/lib/websocket'
import type { WSMessage } from '@/lib/websocket'
import type { Task } from '@/types'

export function useWebSocket(workspaceId: string, projectId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!workspaceId) return

    wsClient.connect(workspaceId)

    const handler = (message: WSMessage) => {
      const key = ['tasks', workspaceId, projectId]

      if (message.type === 'task.created') {
        const task = message.task as Task
        
        if (task.projectId !== projectId) return
        queryClient.setQueryData<Task[]>(key, (prev) => {
          if (!prev) return [task]
          
          if (prev.find((t) => t.id === task.id)) return prev
          return [...prev, task]
        })
      }

      if (message.type === 'task.updated') {
        const task = message.task as Task
        queryClient.setQueryData<Task[]>(key, (prev) => {
          if (!prev) return prev
          return prev.map((t) => (t.id === task.id ? task : t))
        })
      }

      if (message.type === 'task.deleted') {
        queryClient.setQueryData<Task[]>(key, (prev) => {
          if (!prev) return prev
          return prev.filter((t) => t.id !== message.taskId)
        })
      }
    }

    wsClient.addListener(handler)

    return () => {
      wsClient.removeListener(handler)
    }
  }, [workspaceId, projectId, queryClient])
}