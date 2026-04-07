import { createWorkspaceWithOwner } from "./workspace.repository";
import {findWorkspacesByUserId} from "./workspace.repository";

type CreateWorkspaceInput = {
  name: string;
  slug: string;
}

export const createWorkspace = async (
  userId: string,
  data: CreateWorkspaceInput
) => {
  try {
    return await createWorkspaceWithOwner(userId, data);
  } catch (error: any) {
    if (error.code === "P2002") {
      throw new Error("Workspace slug already exists");
    }

    throw error;
  }
};

export const getUserWorkspaces =async (userId: string) => {
  const workspaces =  await findWorkspacesByUserId(userId);

  return workspaces.map((item: typeof workspaces[0]) => ({
    id: item.workspace.id,       
    name: item.workspace.name,
    slug: item.workspace.slug,
    createdAt: item.workspace.createdAt,
    role: item.role
  })
  )
}