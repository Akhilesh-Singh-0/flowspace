import { createProject, viewProject, editProject, removeProject, findProjectById } from "./project.repository"
import { AppError } from "@/middleware/errorHandler"

type ProjectInput = {
    title: string;
    description?: string;
}

const ensureProjectInWorkspace = async (workspaceId: string, projectId: string) => {
    const project = await findProjectById(projectId)
    if (!project || project.workspaceId !== workspaceId) {
        // Return a 404 rather than 403 so we don't leak whether the project
        // exists in a different workspace the caller can't see.
        throw new AppError("Project not found", 404)
    }
}

export const addProject =async (workspaceId: string, data: ProjectInput) => {
    return createProject(workspaceId, data)
}

export const getProjects =async (workspaceId: string) => {
    return viewProject(workspaceId)
}

export const updateProject = async (workspaceId: string, projectId: string, data: { title?: string, description?: string }) => {
    await ensureProjectInWorkspace(workspaceId, projectId)
    return editProject(projectId, data)
}

export const deleteProject =async (workspaceId: string, projectId: string) => {
    await ensureProjectInWorkspace(workspaceId, projectId)
    return removeProject(projectId)
}
