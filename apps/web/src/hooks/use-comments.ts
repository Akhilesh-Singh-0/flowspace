'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { toast } from 'sonner'
import api, { setAuthToken } from '@/lib/api'
import type { Comment } from '@/types'

async function fetchComments(workspaceId: string, taskId: string, token: string) {
  setAuthToken(token)
  const res = await api.get(`/workspaces/${workspaceId}/tasks/${taskId}/comments`)
  return res.data.data as Comment[]
}

async function createComment(workspaceId: string, taskId: string, body: string, token: string) {
  setAuthToken(token)
  const res = await api.post(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, { body })
  return res.data.data as Comment
}

async function deleteComment(workspaceId: string, taskId: string, commentId: string, token: string) {
  setAuthToken(token)
  await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`)
}

export function useComments(workspaceId: string, taskId: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['comments', workspaceId, taskId],
    queryFn: async () => {
      const token = await getToken()
      return fetchComments(workspaceId, taskId, token!)
    },
    enabled: !!workspaceId && !!taskId,
  })
}

export function useCreateComment(workspaceId: string, taskId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: string) => {
      const token = await getToken()
      return createComment(workspaceId, taskId, body, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workspaceId, taskId] })
      toast.success('Comment added')
    },
    onError: () => {
      toast.error('Failed to add comment')
    },
  })
}

export function useDeleteComment(workspaceId: string, taskId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      const token = await getToken()
      return deleteComment(workspaceId, taskId, commentId, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workspaceId, taskId] })
      toast.success('Comment deleted')
    },
    onError: () => {
      toast.error('Failed to delete comment')
    },
  })
}