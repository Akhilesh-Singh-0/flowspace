import { WorkspaceRole } from "@prisma/client";
import { createWorkspaceWithOwner } from "./workspace.repository";
import { findWorkspacesByUserId}  from "./workspace.repository";
import { findWorkspaceMember } from "./workspace.repository";
import { findUserById } from "./workspace.repository";
import { createWorkspaceMember } from "./workspace.repository";
import { deleteWorkspaceMember } from "./workspace.repository";
import { findWorkspaceMembers } from "./workspace.repository";

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

export const addWorkspaceMember = async (requesterId: string, workspaceId: string, targetUserId: string, role: WorkspaceRole) => {

  const requesterMember = await findWorkspaceMember(requesterId, workspaceId)
  if(!requesterMember || !['OWNER', 'ADMIN'].includes(requesterMember.role)){
    throw new Error("Forbidden")
  } 

  const userExist = await findUserById(targetUserId)
  if(!userExist){
    throw new Error("User does not exist")
  }

  const alreadyMember = await findWorkspaceMember(targetUserId, workspaceId)
  if(alreadyMember){
    throw new Error("User is already a member")
  }

  return createWorkspaceMember(targetUserId, workspaceId, role)
}