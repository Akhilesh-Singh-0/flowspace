import { PrismaClient, WorkspaceRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...\n");

  // Clean existing data
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  // Create 6 users with fake clerkIds
  const users = await Promise.all([
    prisma.user.create({
      data: {
        clerkId: "clerk_user_1",
        email: "alice@flowspace.dev",
        name: "Alice Owner",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_user_2",
        email: "bob@flowspace.dev",
        name: "Bob Admin",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_user_3",
        email: "charlie@flowspace.dev",
        name: "Charlie Member",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_user_4",
        email: "diana@flowspace.dev",
        name: "Diana Viewer",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_user_5",
        email: "eve@flowspace.dev",
        name: "Eve Admin",
      },
    }),
    prisma.user.create({
      data: {
        clerkId: "clerk_user_6",
        email: "frank@flowspace.dev",
        name: "Frank Member",
      },
    }),
  ]);

  console.log(`Created ${users.length} users:`);
  users.forEach((u) => console.log(`  - ${u.name} (${u.email}) [clerkId: ${u.clerkId}]`));

  // Create 2 workspaces
  const workspace1 = await prisma.workspace.create({
    data: { name: "Engineering Team", slug: "engineering-team" },
  });

  const workspace2 = await prisma.workspace.create({
    data: { name: "Design Studio", slug: "design-studio" },
  });

  console.log(`\nCreated 2 workspaces:`);
  console.log(`  - ${workspace1.name} (slug: ${workspace1.slug})`);
  console.log(`  - ${workspace2.name} (slug: ${workspace2.slug})`);

  // Workspace 1 — "Engineering Team"
  //   Alice  → OWNER
  //   Bob    → ADMIN
  //   Charlie → MEMBER
  //   Diana  → VIEWER
  const ws1Members = await Promise.all([
    prisma.workspaceMember.create({
      data: { userId: users[0]!.id, workspaceId: workspace1.id, role: WorkspaceRole.OWNER },
    }),
    prisma.workspaceMember.create({
      data: { userId: users[1]!.id, workspaceId: workspace1.id, role: WorkspaceRole.ADMIN },
    }),
    prisma.workspaceMember.create({
      data: { userId: users[2]!.id, workspaceId: workspace1.id, role: WorkspaceRole.MEMBER },
    }),
    prisma.workspaceMember.create({
      data: { userId: users[3]!.id, workspaceId: workspace1.id, role: WorkspaceRole.VIEWER },
    }),
  ]);

  // Workspace 2 — "Design Studio"
  //   Eve    → OWNER
  //   Frank  → ADMIN
  //   Alice  → MEMBER (also OWNER in workspace 1 — tests multi-workspace membership)
  //   Bob    → VIEWER (ADMIN in workspace 1, VIEWER here — tests different roles across workspaces)
  const ws2Members = await Promise.all([
    prisma.workspaceMember.create({
      data: { userId: users[4]!.id, workspaceId: workspace2.id, role: WorkspaceRole.OWNER },
    }),
    prisma.workspaceMember.create({
      data: { userId: users[5]!.id, workspaceId: workspace2.id, role: WorkspaceRole.ADMIN },
    }),
    prisma.workspaceMember.create({
      data: { userId: users[0]!.id, workspaceId: workspace2.id, role: WorkspaceRole.MEMBER },
    }),
    prisma.workspaceMember.create({
      data: { userId: users[1]!.id, workspaceId: workspace2.id, role: WorkspaceRole.VIEWER },
    }),
  ]);

  console.log(`\nWorkspace 1 — "${workspace1.name}" members:`);
  console.log(`  - Alice  → OWNER`);
  console.log(`  - Bob    → ADMIN`);
  console.log(`  - Charlie → MEMBER`);
  console.log(`  - Diana  → VIEWER`);

  console.log(`\nWorkspace 2 — "${workspace2.name}" members:`);
  console.log(`  - Eve    → OWNER`);
  console.log(`  - Frank  → ADMIN`);
  console.log(`  - Alice  → MEMBER`);
  console.log(`  - Bob    → VIEWER`);

  console.log(`\nTotal memberships created: ${ws1Members.length + ws2Members.length}`);
  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
