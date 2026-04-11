import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "@/app";
import { seedTestDatabase, prisma } from "./setup";
import type { Express } from "express";

// Dynamically import supertest-like functionality using the app directly
let app: ReturnType<typeof createApp>;
let users: Awaited<ReturnType<typeof seedTestDatabase>>["users"];
let workspace1: Awaited<ReturnType<typeof seedTestDatabase>>["workspace1"];
let workspace2: Awaited<ReturnType<typeof seedTestDatabase>>["workspace2"];

// Helper to make authenticated requests
function authHeader(clerkId: string) {
  return { Authorization: `Bearer test_${clerkId}` };
}

// Helper to make HTTP requests against the Express app
async function request(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options?: { headers?: Record<string, string>; body?: unknown }
) {
  const port = 0; // random port
  const server = app.listen(port);
  const address = server.address();
  const baseUrl =
    typeof address === "string"
      ? address
      : `http://127.0.0.1:${address!.port}`;

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    };

    if (options?.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${baseUrl}${path}`, fetchOptions);
    const json = await res.json().catch(() => null);
    return { status: res.status, body: json };
  } finally {
    server.close();
  }
}

beforeAll(async () => {
  app = createApp();
  const seeded = await seedTestDatabase();
  users = seeded.users;
  workspace1 = seeded.workspace1;
  workspace2 = seeded.workspace2;
});

afterAll(async () => {
  await prisma.$disconnect();
});

// ─── AUTH ────────────────────────────────────────────────────────────────────

describe("Auth Routes", () => {
  it("POST /auth/webhook — should reject requests without valid svix headers", async () => {
    const res = await request("POST", "/auth/webhook", {
      body: { type: "user.created", data: {} },
    });
    // Without valid svix signature, should fail (500 from svix verification)
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─── WORKSPACES ─────────────────────────────────────────────────────────────

describe("Workspace Routes", () => {
  // ── POST /workspaces ──────────────────────────────────────────────────

  describe("POST /workspaces — create workspace", () => {
    it("should return 401 without auth token", async () => {
      const res = await request("POST", "/workspaces", {
        body: { name: "No Auth Workspace", slug: "no-auth-ws" },
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should create a workspace and assign caller as OWNER (Alice)", async () => {
      const res = await request("POST", "/workspaces", {
        headers: authHeader("clerk_user_1"),
        body: { name: "Alice New Workspace", slug: "alice-new-ws" },
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe("Alice New Workspace");
      expect(res.body.data.slug).toBe("alice-new-ws");

      // Verify OWNER role was assigned
      const member = await prisma.workspaceMember.findFirst({
        where: { workspaceId: res.body.data.id, userId: users[0]!.id },
      });
      expect(member).not.toBeNull();
      expect(member!.role).toBe("OWNER");
    });

    it("should reject duplicate slug", async () => {
      const res = await request("POST", "/workspaces", {
        headers: authHeader("clerk_user_1"),
        body: { name: "Duplicate", slug: "alice-new-ws" },
      });
      // Should fail with conflict or error
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject invalid slug format", async () => {
      const res = await request("POST", "/workspaces", {
        headers: authHeader("clerk_user_1"),
        body: { name: "Bad Slug", slug: "INVALID SLUG!!" },
      });
      expect(res.status).toBe(400);
    });

    it("should reject empty name", async () => {
      const res = await request("POST", "/workspaces", {
        headers: authHeader("clerk_user_1"),
        body: { name: "", slug: "empty-name-ws" },
      });
      expect(res.status).toBe(400);
    });
  });

  // ── GET /workspaces ───────────────────────────────────────────────────

  describe("GET /workspaces — list user workspaces", () => {
    it("should return 401 without auth token", async () => {
      const res = await request("GET", "/workspaces");
      expect(res.status).toBe(401);
    });

    it("should return workspaces for Alice (member of both + newly created)", async () => {
      const res = await request("GET", "/workspaces", {
        headers: authHeader("clerk_user_1"),
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      // Alice is in workspace1 (OWNER), workspace2 (MEMBER), and alice-new-ws (OWNER)
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it("should return workspaces for Charlie (member of workspace1 only)", async () => {
      const res = await request("GET", "/workspaces", {
        headers: authHeader("clerk_user_3"),
      });
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Engineering Team");
      expect(res.body.data[0].role).toBe("MEMBER");
    });

    it("should return workspaces for Eve (OWNER of workspace2 only)", async () => {
      const res = await request("GET", "/workspaces", {
        headers: authHeader("clerk_user_5"),
      });
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe("Design Studio");
      expect(res.body.data[0].role).toBe("OWNER");
    });
  });

  // ── POST /workspaces/:id/members ──────────────────────────────────────

  describe("POST /workspaces/:id/members — add member", () => {
    it("should return 401 without auth token", async () => {
      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        body: { targetUserId: users[4]!.id, role: "MEMBER" },
      });
      expect(res.status).toBe(401);
    });

    it("OWNER (Alice) can add Eve to workspace1 as MEMBER", async () => {
      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_1"),
        body: { targetUserId: users[4]!.id, role: "MEMBER" },
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("MEMBER");
    });

    it("ADMIN (Bob) can add Frank to workspace1 as VIEWER", async () => {
      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_2"),
        body: { targetUserId: users[5]!.id, role: "VIEWER" },
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("VIEWER");
    });

    it("MEMBER (Charlie) cannot add members — should be forbidden", async () => {
      // First create a new user to attempt adding
      const tempUser = await prisma.user.create({
        data: { clerkId: "clerk_temp_1", email: "temp1@flowspace.dev", name: "Temp User" },
      });

      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_3"),
        body: { targetUserId: tempUser.id, role: "MEMBER" },
      });
      // Charlie is a MEMBER, should not be allowed
      expect(res.status).toBeGreaterThanOrEqual(400);

      // Clean up temp user
      await prisma.user.delete({ where: { id: tempUser.id } });
    });

    it("VIEWER (Diana) cannot add members — should be forbidden", async () => {
      const tempUser = await prisma.user.create({
        data: { clerkId: "clerk_temp_2", email: "temp2@flowspace.dev", name: "Temp User 2" },
      });

      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_4"),
        body: { targetUserId: tempUser.id, role: "MEMBER" },
      });
      expect(res.status).toBeGreaterThanOrEqual(400);

      await prisma.user.delete({ where: { id: tempUser.id } });
    });

    it("should reject adding a user who is already a member", async () => {
      // Bob is already in workspace1
      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_1"),
        body: { targetUserId: users[1]!.id, role: "ADMIN" },
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject adding a non-existent user", async () => {
      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_1"),
        body: { targetUserId: "non_existent_user_id", role: "MEMBER" },
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("should reject invalid role value", async () => {
      const tempUser = await prisma.user.create({
        data: { clerkId: "clerk_temp_3", email: "temp3@flowspace.dev", name: "Temp User 3" },
      });

      const res = await request("POST", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_1"),
        body: { targetUserId: tempUser.id, role: "SUPERADMIN" },
      });
      expect(res.status).toBe(400);

      await prisma.user.delete({ where: { id: tempUser.id } });
    });
  });

  // ── GET /workspaces/:id/members ───────────────────────────────────────

  describe("GET /workspaces/:id/members — list workspace members", () => {
    it("should return 401 without auth token", async () => {
      const res = await request("GET", `/workspaces/${workspace1.id}/members`);
      expect(res.status).toBe(401);
    });

    it("OWNER (Alice) can list members of workspace1", async () => {
      const res = await request("GET", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_1"),
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      // workspace1 now has: Alice(OWNER), Bob(ADMIN), Charlie(MEMBER), Diana(VIEWER), Eve(MEMBER), Frank(VIEWER)
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });

    it("VIEWER (Diana) can list members of workspace1", async () => {
      const res = await request("GET", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_4"),
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("OWNER (Eve) can list members of workspace2", async () => {
      const res = await request("GET", `/workspaces/${workspace2.id}/members`, {
        headers: authHeader("clerk_user_5"),
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
    });

    it("Non-member (Charlie) cannot list members of workspace2", async () => {
      const res = await request("GET", `/workspaces/${workspace2.id}/members`, {
        headers: authHeader("clerk_user_3"),
      });
      // Charlie is not in workspace2
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("members include correct user details (id, name, email, role)", async () => {
      const res = await request("GET", `/workspaces/${workspace1.id}/members`, {
        headers: authHeader("clerk_user_1"),
      });
      expect(res.status).toBe(200);

      const members = res.body.data;
      // Check that each member has the expected shape
      for (const member of members) {
        expect(member).toHaveProperty("role");
        expect(member).toHaveProperty("user");
        expect(member.user).toHaveProperty("id");
        expect(member.user).toHaveProperty("name");
        expect(member.user).toHaveProperty("email");
      }
    });
  });
});
