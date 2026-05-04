import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import api, { setAuthToken } from '@/lib/api'
import type { Task, TaskStatus, TaskPriority } from '@/types'

async function fetchTasks(
  token: string,
  workspaceId: string,
  projectId: string
): Promise<Task[]> {
  setAuthToken(token)
  const res = await api.get(`/workspaces/${workspaceId}/projects/${projectId}/tasks`)
  return res.data.data
}

async function createTask(
  token: string,
  workspaceId: string,
  projectId: string,
  data: {
    title: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
  }
): Promise<Task> {
  setAuthToken(token)
  const res = await api.post(
    `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    data
  )
  return res.data.data
}

export function useTasks(workspaceId: string, projectId: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['tasks', workspaceId, projectId],
    queryFn: async () => {
      const token = await getToken()
      return fetchTasks(token!, workspaceId, projectId)
    },
    enabled: !!workspaceId && !!projectId,
  })
}

export function useCreateTask(workspaceId: string, projectId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      title: string
      description?: string
      status?: TaskStatus
      priority?: TaskPriority
    }) => {
      const token = await getToken()
      return createTask(token!, workspaceId, projectId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId, projectId] })
    },
  })
}
