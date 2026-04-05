import { prisma } from "@/lib/prisma";

type createWorkspaceInput={
    name: string;
    slug: string;
}

export const createWorkspace =async (userId: string, data: createWorkspaceInput) => {
    try {
        const workspace = await prisma.$transaction(async (tx)=>{
            const createWorkspace = await tx.workspace.create({
                data: {
                    name: data.name,
                    slug: data.slug
                }
            })

            await tx.workspaceMember.create({
                data: {
                    userId,
                    workspaceId: createWorkspace.id,
                    role: "OWNER"
                }
            })
            return createWorkspace;
        })
        return workspace;

    } catch (error: any) {
        if(error.code === "P2002"){
            throw new Error("Workspace slug already exists");
        }

        throw error;
    }
}
