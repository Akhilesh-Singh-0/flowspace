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

async function updateTask(
  token: string,
  workspaceId: string,
  taskId: string,
  data: {
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: string | null
    assigneeId?: string | null
  }
): Promise<Task> {
  setAuthToken(token)
  console.log('PATCH URL:', `/workspaces/${workspaceId}/tasks/${taskId}`)
  console.log('PATCH data:', data)
  const res = await api.patch(`/workspaces/${workspaceId}/tasks/${taskId}`, data)
  console.log('PATCH response:', res.data)
  return res.data.data
}

async function deleteTask(
  token: string,
  workspaceId: string,
  taskId: string
): Promise<void> {
  setAuthToken(token)
  await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`)
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

export function useUpdateTask(workspaceId: string, projectId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      data,
    }: {
      taskId: string
      data: {
        title?: string
        description?: string
        status?: TaskStatus
        priority?: TaskPriority
        dueDate?: string | null
        assigneeId?: string | null
      }
    }) => {
      console.log('mutationFn called — taskId:', taskId, 'data:', data)
      const token = await getToken()
      console.log('token first 20:', token?.slice(0, 20))
      return updateTask(token!, workspaceId, taskId, data)
    },
    onSuccess: (updatedTask) => {
      console.log('onSuccess — updatedTask:', updatedTask)
      queryClient.setQueryData(
        ['tasks', workspaceId, projectId],
        (old: Task[] | undefined) =>
          old?.map((t) => (t.id === updatedTask.id ? updatedTask : t)) ?? []
      )
    },
    onError: (error) => {
      console.error('updateTask error:', error)
    },
  })
}

export function useDeleteTask(workspaceId: string, projectId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (taskId: string) => {
      const token = await getToken()
      return deleteTask(token!, workspaceId, taskId)
    },
    onSuccess: (_, taskId) => {
      queryClient.setQueryData(
        ['tasks', workspaceId, projectId],
        (old: Task[] | undefined) => old?.filter((t) => t.id !== taskId) ?? []
      )
    },
  })
}