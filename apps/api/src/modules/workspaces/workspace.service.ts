import { createWorkspaceWithOwner } from "./workspace.repository";

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