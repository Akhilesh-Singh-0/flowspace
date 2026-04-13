import { createProject, viewProject, editProject } from "./project.repository"
import { AppError } from "@/middleware/errorHandler"

type ProjectInput = {
    title: string;
    description?: string;
}

export const addProject =async (workspaceId: string, data: ProjectInput) => {
    return createProject(workspaceId, data)
}

export const getProjects =async (workspaceId: string) => {
    return viewProject(workspaceId)
}

export const updateProject = async (projectId: string, data: { title?: string, description?: string }) => {
    return editProject(projectId, data)
}