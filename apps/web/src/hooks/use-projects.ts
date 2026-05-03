import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import api, { setAuthToken } from '@/lib/api'
import type { Project } from '@/types'

async function fetchProjects(token: string, workspaceId: string): Promise<Project[]> {
  setAuthToken(token)
  const res = await api.get(`/workspaces/${workspaceId}/projects`)
  return res.data.data
}

async function createProject(
  token: string,
  workspaceId: string,
  data: { title: string; description?: string }
): Promise<Project> {
  setAuthToken(token)
  const res = await api.post(`/workspaces/${workspaceId}/projects`, data)
  return res.data.data
}

export function useProjects(workspaceId: string) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const token = await getToken()
      return fetchProjects(token!, workspaceId)
    },
    enabled: !!workspaceId,
  })
}

export function useCreateProject(workspaceId: string) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const token = await getToken()
      return createProject(token!, workspaceId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
    },
  })
}