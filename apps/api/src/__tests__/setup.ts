import { PrismaClient, WorkspaceRole } from "@prisma/client";
import { vi } from "vitest";

const prisma = new PrismaClient();

// Mock the Clerk verifyToken so we can test routes without real JWTs
vi.mock("@clerk/backend", () => ({
  verifyToken: vi.fn(async (token: string) => {
    // Token format: "test_<clerkId>" → returns { sub: clerkId }
    if (token.startsWith("test_")) {
      return { sub: token.replace("test_", "") };
    }
    throw new Error("Invalid token");
  }),
}));

// Seed the database before all tests
export async function seedTestDatabase() {
  // Clean existing data
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: { clerkId: "clerk_user_1", email: "alice@flowspace.dev", name: "Alice Owner" },
    }),
    prisma.user.create({
      data: { clerkId: "clerk_user_2", email: "bob@flowspace.dev", name: "Bob Admin" },
    }),
    prisma.user.create({
      data: { clerkId: "clerk_user_3", email: "charlie@flowspace.dev", name: "Charlie Member" },
    }),
    prisma.user.create({
      data: { clerkId: "clerk_user_4", email: "diana@flowspace.dev", name: "Diana Viewer" },
    }),
    prisma.user.create({
      data: { clerkId: "clerk_user_5", email: "eve@flowspace.dev", name: "Eve Admin" },
    }),
    prisma.user.create({
      data: { clerkId: "clerk_user_6", email: "frank@flowspace.dev", name: "Frank Member" },
    }),
  ]);

  const workspace1 = await prisma.workspace.create({
    data: { name: "Engineering Team", slug: "engineering-team" },
  });

  const workspace2 = await prisma.workspace.create({
    data: { name: "Design Studio", slug: "design-studio" },
  });

  // Workspace 1: Alice=OWNER, Bob=ADMIN, Charlie=MEMBER, Diana=VIEWER
  await Promise.all([
    prisma.workspaceMember.create({ data: { userId: users[0]!.id, workspaceId: workspace1.id, role: WorkspaceRole.OWNER } }),
    prisma.workspaceMember.create({ data: { userId: users[1]!.id, workspaceId: workspace1.id, role: WorkspaceRole.ADMIN } }),
    prisma.workspaceMember.create({ data: { userId: users[2]!.id, workspaceId: workspace1.id, role: WorkspaceRole.MEMBER } }),
    prisma.workspaceMember.create({ data: { userId: users[3]!.id, workspaceId: workspace1.id, role: WorkspaceRole.VIEWER } }),
  ]);

  // Workspace 2: Eve=OWNER, Frank=ADMIN, Alice=MEMBER, Bob=VIEWER
  await Promise.all([
    prisma.workspaceMember.create({ data: { userId: users[4]!.id, workspaceId: workspace2.id, role: WorkspaceRole.OWNER } }),
    prisma.workspaceMember.create({ data: { userId: users[5]!.id, workspaceId: workspace2.id, role: WorkspaceRole.ADMIN } }),
    prisma.workspaceMember.create({ data: { userId: users[0]!.id, workspaceId: workspace2.id, role: WorkspaceRole.MEMBER } }),
    prisma.workspaceMember.create({ data: { userId: users[1]!.id, workspaceId: workspace2.id, role: WorkspaceRole.VIEWER } }),
  ]);

  return { users, workspace1, workspace2 };
}

export { prisma };
