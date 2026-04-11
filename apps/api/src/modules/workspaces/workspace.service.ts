import { WorkspaceRole } from "@prisma/client";
import { 
  createWorkspaceWithOwner,
  findWorkspacesByUserId,
  findWorkspaceMember,
  findUserById,
  createWorkspaceMember,
  findWorkspaceMembers,
  findUserByClerkId,
  deleteWorkspaceMember,
  countWorkspaceOwners
} from "./workspace.repository";
import { AppError } from "@/middleware/errorHandler";
import { Prisma } from "@prisma/client";

type CreateWorkspaceInput = {
  name: string;
  slug: string;
}

export const createWorkspace = async (
  userId: string,
  data: CreateWorkspaceInput
) => {
  try {
    const dbUser = await findUserByClerkId(userId)
  
    if(!dbUser) throw new AppError("User not found", 404)
    return await createWorkspaceWithOwner(dbUser.id, data);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Workspace slug already exists", 409)
    }
  
    throw error;
  }
};

export const getUserWorkspaces =async (userId: string) => {
    const dbUser = await findUserByClerkId(userId)
    
    if(!dbUser) throw new AppError("User not found", 404)

    const workspaces = await findWorkspacesByUserId(dbUser.id);

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

  const dbUser = await findUserByClerkId(requesterId)
  
  if(!dbUser) throw new AppError("User not found", 404)
  const requesterMember = await findWorkspaceMember(dbUser.id, workspaceId)

  if(!requesterMember || !['OWNER', 'ADMIN'].includes(requesterMember.role)){
    throw new AppError("Forbidden", 403)
  } 

  const userExist = await findUserById(targetUserId)
  if(!userExist){
    throw new AppError("User does not exist", 404)
  }

  const alreadyMember = await findWorkspaceMember(targetUserId, workspaceId)
  if(alreadyMember){
    throw new AppError("User is already a member", 409)
  }

  return createWorkspaceMember(targetUserId, workspaceId, role)
}

export const getWorkspaceMembers = async (requesterId: string, workspaceId:  string) => {
  const dbUser = await findUserByClerkId(requesterId)
  
  if(!dbUser) throw new AppError("User not found", 404)
  const requesterMember = await findWorkspaceMember(dbUser.id, workspaceId)

  if(!requesterMember){
    throw new AppError("You are not a member of this workspace", 403)
  }

  const workspaceMembers = await findWorkspaceMembers(workspaceId);

  return workspaceMembers;
}

const ensureNotLastOwner = async (workspaceId: string) => {
  const ownerCount = await countWorkspaceOwners(workspaceId)

  if (ownerCount === 1) {
    throw new AppError("Cannot remove the last owner", 400)
  }
}

export const removeWorkspaceMember = async (requesterId: string, targetUserId: string, workspaceId: string) => {
  
  const requester = await findWorkspaceMember(requesterId, workspaceId)
  const target = await findWorkspaceMember(targetUserId, workspaceId)

  if(!requester){
    throw new AppError("Requester is not part of workspace", 403)
  }

  if(!target){
    throw new AppError("Target user is not member of workspace", 404)
  }

  if(requesterId === targetUserId){
    if(requester.role !== "OWNER"){
      await deleteWorkspaceMember(workspaceId, targetUserId)
      return;
    }

    await ensureNotLastOwner(workspaceId);
  
    await deleteWorkspaceMember(workspaceId, targetUserId)
    return 
  }
  
  if (requester.role === "MEMBER" || requester.role === "VIEWER") {
    throw new AppError("Not authorized", 403)
  }

  if(requester.role === "ADMIN"){
    if(target.role === "OWNER" || target.role === "ADMIN"){
      throw new AppError("Admin cannot remove owner or admin", 403)
    }
  
    await deleteWorkspaceMember(workspaceId, targetUserId)
    return
  }

  if(requester.role === "OWNER"){
    if(target.role === "OWNER"){
      await ensureNotLastOwner(workspaceId)
    }

    await deleteWorkspaceMember(workspaceId, targetUserId)
    return;
  }
}