import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskStatus, TaskPriority } from "@prisma/client";

/**
 * Service-layer tests for task creation.
 *
 * `addTask` is responsible for:
 *   1. Verifying the target project exists (404 otherwise).
 *   2. Verifying the creating Clerk user has been synced to our DB (404 otherwise).
 *   3. Resolving the workspace from the project (not from the request) so callers
 *      cannot spoof workspaceId.
 *   4. Delegating the actual write to the repository with a clean input shape.
 *
 * The repository layer and user lookup are mocked so the tests stay
 * deterministic and do not require a database.
 */

vi.mock("../task.repository", () => ({
  findProjectById: vi.fn(),
  createTask: vi.fn(),
  viewTask: vi.fn(),
  findTaskById: vi.fn(),
  editTask: vi.fn(),
  removeTask: vi.fn(),
}));

vi.mock("@/lib/user.repository", () => ({
  findUserByClerkId: vi.fn(),
  findUserById: vi.fn(),
}));

import { addTask } from "../task.service";
import { findProjectById, createTask } from "../task.repository";
import { findUserByClerkId } from "@/lib/user.repository";
import { AppError } from "@/middleware/errorHandler";

const mockedFindProjectById = vi.mocked(findProjectById);
const mockedCreateTask = vi.mocked(createTask);
const mockedFindUserByClerkId = vi.mocked(findUserByClerkId);

describe("addTask (task creation service)", () => {
  const clerkId = "user_clerk_123";
  const dbUserId = "db_user_456";
  const projectId = "project_789";
  const workspaceId = "workspace_abc";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("happy path", () => {
    it("creates a task using the project's workspaceId and the DB user id", async () => {
      mockedFindProjectById.mockResolvedValue({ id: projectId, workspaceId });
      mockedFindUserByClerkId.mockResolvedValue({ id: dbUserId });
      mockedCreateTask.mockResolvedValue({
        id: "task_1",
        projectId,
        workspaceId,
        creatorId: dbUserId,
        title: "Ship it",
      } as any);

      const result = await addTask(clerkId, projectId, { title: "Ship it" });

      expect(mockedFindProjectById).toHaveBeenCalledWith(projectId);
      expect(mockedFindUserByClerkId).toHaveBeenCalledWith(clerkId);
      expect(mockedCreateTask).toHaveBeenCalledWith(
        projectId,
        workspaceId,
        dbUserId,
        { title: "Ship it" },
      );
      expect(result).toMatchObject({ id: "task_1", title: "Ship it" });
    });

    it("forwards all optional fields (description, status, priority, dueDate)", async () => {
      mockedFindProjectById.mockResolvedValue({ id: projectId, workspaceId });
      mockedFindUserByClerkId.mockResolvedValue({ id: dbUserId });
      mockedCreateTask.mockResolvedValue({ id: "task_2" } as any);

      const dueDate = new Date("2030-01-01T00:00:00.000Z");
      await addTask(clerkId, projectId, {
        title: "Full payload",
        description: "detail",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate,
      });

      expect(mockedCreateTask).toHaveBeenCalledWith(projectId, workspaceId, dbUserId, {
        title: "Full payload",
        description: "detail",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate,
      });
    });

    it("ignores the requester-provided workspaceId and uses project.workspaceId", async () => {
      // The service resolves workspace from the project, not the caller; this
      // test guards against regressions that might trust caller-supplied data.
      mockedFindProjectById.mockResolvedValue({
        id: projectId,
        workspaceId: "real_ws_from_project",
      });
      mockedFindUserByClerkId.mockResolvedValue({ id: dbUserId });
      mockedCreateTask.mockResolvedValue({ id: "task_3" } as any);

      await addTask(clerkId, projectId, { title: "no spoof" });

      expect(mockedCreateTask).toHaveBeenCalledWith(
        projectId,
        "real_ws_from_project",
        dbUserId,
        { title: "no spoof" },
      );
    });
  });

  describe("error paths", () => {
    it("throws AppError(404) when the project does not exist", async () => {
      mockedFindProjectById.mockResolvedValue(null);

      await expect(addTask(clerkId, projectId, { title: "x" })).rejects.toMatchObject({
        message: "Project does not exists",
        statusCode: 404,
      });
      await expect(addTask(clerkId, projectId, { title: "x" })).rejects.toBeInstanceOf(AppError);
      expect(mockedCreateTask).not.toHaveBeenCalled();
    });

    it("does not call findUserByClerkId if the project lookup fails", async () => {
      mockedFindProjectById.mockResolvedValue(null);

      await expect(addTask(clerkId, projectId, { title: "x" })).rejects.toBeInstanceOf(AppError);

      expect(mockedFindUserByClerkId).not.toHaveBeenCalled();
    });

    it("throws AppError(404) when the Clerk user has no synced DB user", async () => {
      mockedFindProjectById.mockResolvedValue({ id: projectId, workspaceId });
      mockedFindUserByClerkId.mockResolvedValue(null);

      await expect(addTask(clerkId, projectId, { title: "x" })).rejects.toMatchObject({
        message: "User not found",
        statusCode: 404,
      });
      expect(mockedCreateTask).not.toHaveBeenCalled();
    });

    it("propagates repository errors from createTask unchanged", async () => {
      mockedFindProjectById.mockResolvedValue({ id: projectId, workspaceId });
      mockedFindUserByClerkId.mockResolvedValue({ id: dbUserId });
      const dbError = new Error("connection lost");
      mockedCreateTask.mockRejectedValue(dbError);

      await expect(addTask(clerkId, projectId, { title: "x" })).rejects.toBe(dbError);
    });
  });

  describe("boundary inputs passed through service", () => {
    // The schema middleware is the first line of defense, but the service
    // should not mangle already-validated input. These guard that contract.
    beforeEach(() => {
      mockedFindProjectById.mockResolvedValue({ id: projectId, workspaceId });
      mockedFindUserByClerkId.mockResolvedValue({ id: dbUserId });
      mockedCreateTask.mockResolvedValue({ id: "t" } as any);
    });

    it("passes a 1-char title through untouched", async () => {
      await addTask(clerkId, projectId, { title: "a" });
      expect(mockedCreateTask).toHaveBeenCalledWith(
        projectId,
        workspaceId,
        dbUserId,
        { title: "a" },
      );
    });

    it("passes a 100-char title through untouched", async () => {
      const title = "x".repeat(100);
      await addTask(clerkId, projectId, { title });
      expect(mockedCreateTask).toHaveBeenCalledWith(
        projectId,
        workspaceId,
        dbUserId,
        { title },
      );
    });
  });
});
