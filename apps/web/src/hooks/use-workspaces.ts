import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import api, { setAuthToken } from '@/lib/api'
import type { Workspace } from '@/types'

async function fetchWorkspaces(token: string): Promise<Workspace[]> {
  setAuthToken(token)
  const res = await api.get('/workspaces')
  return res.data.data
}

async function createWorkspace(
  token: string,
  data: { name: string; slug: string }
): Promise<Workspace> {
  setAuthToken(token)
  const res = await api.post('/workspaces', data)
  return res.data.data
}

export function useWorkspaces() {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const token = await getToken()
      return fetchWorkspaces(token!)
    },
  })
}

export function useCreateWorkspace() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      const token = await getToken()
      return createWorkspace(token!, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}