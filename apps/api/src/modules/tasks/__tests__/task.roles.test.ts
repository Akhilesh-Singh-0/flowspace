import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { WorkspaceRole } from "@prisma/client";

/**
 * Permission / RBAC tests for task creation.
 *
 * The task create route is:
 *   POST /workspaces/:workspaceId/projects/:projectId/tasks
 *     authMiddleware
 *     requireRole("OWNER", "ADMIN", "MEMBER")
 *     validate(TaskInput)
 *     createTaskHandler
 *
 * These tests exercise `requireRole` with the exact argument set used by the
 * task create route, covering every WorkspaceRole plus non-member / unsynced
 * user cases.
 */

vi.mock("@/modules/workspaces/workspace.repository", () => ({
  findWorkspaceMember: vi.fn(),
}));

vi.mock("@/lib/user.repository", () => ({
  findUserByClerkId: vi.fn(),
  findUserById: vi.fn(),
}));

import { requireRole } from "@/middleware/requireRole";
import { findWorkspaceMember } from "@/modules/workspaces/workspace.repository";
import { findUserByClerkId } from "@/lib/user.repository";
import { AppError } from "@/middleware/errorHandler";

const mockedFindWorkspaceMember = vi.mocked(findWorkspaceMember);
const mockedFindUserByClerkId = vi.mocked(findUserByClerkId);

// The create-task route uses exactly this role set.
const TASK_CREATE_ROLES: WorkspaceRole[] = ["OWNER", "ADMIN", "MEMBER"];

type MockReq = Partial<Request> & {
  user?: { userId: string };
  params: { workspaceId?: string; id?: string };
};

const buildReq = (overrides: Partial<MockReq> = {}): MockReq => ({
  user: { userId: "clerk_user_1" },
  params: { workspaceId: "ws_1" },
  ...overrides,
});

const buildNext = () => vi.fn() as unknown as NextFunction;
const buildRes = () => ({} as Response);

describe("requireRole middleware — task creation permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("allowed roles (OWNER / ADMIN / MEMBER)", () => {
    it.each(TASK_CREATE_ROLES)("allows role %s to create tasks", async (role) => {
      mockedFindUserByClerkId.mockResolvedValue({ id: "db_user_1" });
      mockedFindWorkspaceMember.mockResolvedValue({
        userId: "db_user_1",
        workspaceId: "ws_1",
        role,
      });

      const middleware = requireRole(...TASK_CREATE_ROLES);
      const req = buildReq();
      const next = buildNext();

      await middleware(req as Request, buildRes(), next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // no-arg = proceed
    });

    it("looks up the workspace member using the DB user id (not the Clerk id)", async () => {
      mockedFindUserByClerkId.mockResolvedValue({ id: "db_user_1" });
      mockedFindWorkspaceMember.mockResolvedValue({
        userId: "db_user_1",
        workspaceId: "ws_1",
        role: "MEMBER",
      });

      const middleware = requireRole(...TASK_CREATE_ROLES);
      await middleware(buildReq() as Request, buildRes(), buildNext());

      expect(mockedFindUserByClerkId).toHaveBeenCalledWith("clerk_user_1");
      expect(mockedFindWorkspaceMember).toHaveBeenCalledWith("db_user_1", "ws_1");
    });
  });

  describe("denied roles", () => {
    it("forbids VIEWER from creating tasks with a 403 AppError", async () => {
      mockedFindUserByClerkId.mockResolvedValue({ id: "db_user_1" });
      mockedFindWorkspaceMember.mockResolvedValue({
        userId: "db_user_1",
        workspaceId: "ws_1",
        role: "VIEWER",
      });

      const middleware = requireRole(...TASK_CREATE_ROLES);
      const next = vi.fn();

      await middleware(buildReq() as Request, buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledTimes(1);
      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ message: "Forbidden", statusCode: 403 });
    });
  });

  describe("membership / user errors", () => {
    it("returns 404 when the Clerk user has no corresponding DB user", async () => {
      mockedFindUserByClerkId.mockResolvedValue(null);

      const middleware = requireRole(...TASK_CREATE_ROLES);
      const next = vi.fn();

      await middleware(buildReq() as Request, buildRes(), next as unknown as NextFunction);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({ message: "User not found", statusCode: 404 });
      // Never continue on to workspace lookup when the user is unknown.
      expect(mockedFindWorkspaceMember).not.toHaveBeenCalled();
    });

    it("returns 404 when the user is not a member of the target workspace", async () => {
      mockedFindUserByClerkId.mockResolvedValue({ id: "db_user_1" });
      mockedFindWorkspaceMember.mockResolvedValue(null);

      const middleware = requireRole(...TASK_CREATE_ROLES);
      const next = vi.fn();

      await middleware(buildReq() as Request, buildRes(), next as unknown as NextFunction);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(AppError);
      expect(err).toMatchObject({
        message: "User is not member of this workspace",
        statusCode: 404,
      });
    });

    it("falls back to req.params.id when workspaceId is absent (legacy routes)", async () => {
      // requireRole resolves the workspace id from either :workspaceId or :id
      // to support older routes. The task create route uses :workspaceId but
      // the contract is shared, so exercise the fallback explicitly.
      mockedFindUserByClerkId.mockResolvedValue({ id: "db_user_1" });
      mockedFindWorkspaceMember.mockResolvedValue({
        userId: "db_user_1",
        workspaceId: "legacy_ws",
        role: "OWNER",
      });

      const middleware = requireRole(...TASK_CREATE_ROLES);
      const next = buildNext();
      const req = buildReq({ params: { id: "legacy_ws" } });

      await middleware(req as Request, buildRes(), next);

      expect(mockedFindWorkspaceMember).toHaveBeenCalledWith("db_user_1", "legacy_ws");
      expect(next).toHaveBeenCalledWith();
    });

    it("propagates unexpected errors from the user lookup via next()", async () => {
      const boom = new Error("db exploded");
      mockedFindUserByClerkId.mockRejectedValue(boom);

      const middleware = requireRole(...TASK_CREATE_ROLES);
      const next = vi.fn();

      await middleware(buildReq() as Request, buildRes(), next as unknown as NextFunction);

      expect(next).toHaveBeenCalledWith(boom);
    });
  });
});
