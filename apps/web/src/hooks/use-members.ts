'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import api, { setAuthToken } from '@/lib/api'
import type { WorkspaceMember } from '@/types'

async function fetchMembers(workspaceId: string, token: string) {
  setAuthToken(token)
  const res = await api.get(`/workspaces/${workspaceId}/members`)
  return res.data.data as WorkspaceMember[]
}

async function inviteMember(
  workspaceId: string,
  targetUserId: string,
  role: string,
  token: string
) {
  setAuthToken(token)
  const res = await api.post(`/workspaces/${workspaceId}/members`, {
    targetUserId,
    role,
  })
  return res.data.data
}

async function removeMember(
  workspaceId: string,
  userId: string,
  token: string
) {
  setAuthToken(token)
  await api.delete(`/workspaces/${workspaceId}/members/${userId}`)
}

export function useMembers(workspaceId: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      const token = await getToken()
      return fetchMembers(workspaceId, token!)
    },
    enabled: !!workspaceId,
  })
}

export function useInviteMember(workspaceId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      targetUserId,
      role,
    }: {
      targetUserId: string
      role: string
    }) => {
      const token = await getToken()
      return inviteMember(workspaceId, targetUserId, role, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
    },
  })
}

export function useRemoveMember(workspaceId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken()
      return removeMember(workspaceId, userId, token!)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
    },
  })
}