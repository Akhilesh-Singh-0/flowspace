'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import api, { setAuthToken } from '@/lib/api'
import type { Label, TaskLabel } from '@/types'

async function fetchTaskLabels(workspaceId: string, taskId: string, token: string) {
  setAuthToken(token)
  const res = await api.get(`/workspaces/${workspaceId}/tasks/${taskId}/labels`)
  return res.data.data as TaskLabel[]
}

async function createLabel(workspaceId: string, name: string, color: string, token: string) {
  setAuthToken(token)
  const res = await api.post(`/workspaces/${workspaceId}/labels`, { name, color })
  return res.data.data as Label
}

async function assignLabel(workspaceId: string, taskId: string, labelId: string, token: string) {
  setAuthToken(token)
  const res = await api.post(`/workspaces/${workspaceId}/tasks/${taskId}/labels`, { labelId })
  return res.data.data
}

async function removeLabel(
  workspaceId: string,
  taskId: string,
  labelId: string,
  token: string
) {
  setAuthToken(token)
  await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}/labels/${labelId}`)
}

export function useTaskLabels(workspaceId: string, taskId: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['labels', workspaceId, taskId],
    queryFn: async () => {
      const token = await getToken()
      return fetchTaskLabels(workspaceId, taskId, token!)
    },
    enabled: !!workspaceId && !!taskId,
  })
}

export function useCreateLabel(workspaceId: string, taskId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const token = await getToken()
      const label = await createLabel(workspaceId, name, color, token!)
      await assignLabel(workspaceId, taskId, label.id, token!)
      return label
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, taskId] })
    },
  })
}

export function useAssignLabel(workspaceId: string, taskId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (labelId: string) => {
      const token = await getToken()
      return assignLabel(workspaceId, taskId, labelId, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, taskId] })
    },
  })
}

export function useRemoveLabel(workspaceId: string, taskId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (labelId: string) => {
      const token = await getToken()
      return removeLabel(workspaceId, taskId, labelId, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', workspaceId, taskId] })
    },
  })
}