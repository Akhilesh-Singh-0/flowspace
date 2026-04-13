import { createProject, viewProject } from "./project.repository"
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