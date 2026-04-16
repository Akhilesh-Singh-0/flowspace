import { describe, it, expect } from "vitest";
import { TaskInput } from "../task.schema";
import { TaskStatus, TaskPriority } from "@prisma/client";

/**
 * Schema-level edge cases for task creation.
 *
 * The create-task route runs `validate(TaskInput)` before reaching the service
 * layer, so any inputs that fail here never hit the database. These tests
 * lock down boundary values, empty inputs, enum validation, and type coercion
 * behavior for each field.
 */
describe("TaskInput schema (create-task validation)", () => {
  describe("title", () => {
    it("accepts the minimum valid length (1 char)", () => {
      const result = TaskInput.safeParse({ title: "a" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.title).toBe("a");
    });

    it("accepts the maximum valid length (100 chars)", () => {
      const title = "a".repeat(100);
      const result = TaskInput.safeParse({ title });
      expect(result.success).toBe(true);
    });

    it("rejects title one char over the 100-char limit", () => {
      const title = "a".repeat(101);
      const result = TaskInput.safeParse({ title });
      expect(result.success).toBe(false);
    });

    it("rejects an empty title", () => {
      const result = TaskInput.safeParse({ title: "" });
      expect(result.success).toBe(false);
    });

    it("rejects a whitespace-only title (trims to empty)", () => {
      const result = TaskInput.safeParse({ title: "    " });
      expect(result.success).toBe(false);
    });

    it("trims surrounding whitespace on a valid title", () => {
      const result = TaskInput.safeParse({ title: "  hello  " });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.title).toBe("hello");
    });

    it("rejects a missing title", () => {
      const result = TaskInput.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects a non-string title (number)", () => {
      const result = TaskInput.safeParse({ title: 123 });
      expect(result.success).toBe(false);
    });

    it("rejects a null title", () => {
      const result = TaskInput.safeParse({ title: null });
      expect(result.success).toBe(false);
    });
  });

  describe("description", () => {
    it("is optional (can be omitted)", () => {
      const result = TaskInput.safeParse({ title: "task" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.description).toBeUndefined();
    });

    it("trims surrounding whitespace", () => {
      const result = TaskInput.safeParse({ title: "task", description: "  text  " });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.description).toBe("text");
    });

    it("rejects a non-string description", () => {
      const result = TaskInput.safeParse({ title: "task", description: 42 });
      expect(result.success).toBe(false);
    });
  });

  describe("status", () => {
    it.each(Object.values(TaskStatus))("accepts valid status: %s", (status) => {
      const result = TaskInput.safeParse({ title: "task", status });
      expect(result.success).toBe(true);
    });

    it("rejects an unknown status enum value", () => {
      const result = TaskInput.safeParse({ title: "task", status: "NOT_A_STATUS" });
      expect(result.success).toBe(false);
    });

    it("rejects a lowercase variant (enum is case-sensitive)", () => {
      const result = TaskInput.safeParse({ title: "task", status: "backlog" });
      expect(result.success).toBe(false);
    });
  });

  describe("priority", () => {
    it.each(Object.values(TaskPriority))("accepts valid priority: %s", (priority) => {
      const result = TaskInput.safeParse({ title: "task", priority });
      expect(result.success).toBe(true);
    });

    it("rejects an unknown priority enum value", () => {
      const result = TaskInput.safeParse({ title: "task", priority: "CRITICAL" });
      expect(result.success).toBe(false);
    });
  });

  describe("dueDate", () => {
    it("coerces a valid ISO string into a Date", () => {
      const result = TaskInput.safeParse({ title: "task", dueDate: "2030-01-01T00:00:00.000Z" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBeInstanceOf(Date);
        expect(result.data.dueDate?.toISOString()).toBe("2030-01-01T00:00:00.000Z");
      }
    });

    it("rejects an unparseable date string", () => {
      const result = TaskInput.safeParse({ title: "task", dueDate: "not-a-date" });
      expect(result.success).toBe(false);
    });

    it("is optional (can be omitted)", () => {
      const result = TaskInput.safeParse({ title: "task" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.dueDate).toBeUndefined();
    });
  });

  describe("full payload", () => {
    it("accepts a complete, well-formed payload", () => {
      const result = TaskInput.safeParse({
        title: "Fix login bug",
        description: "Users cannot sign in with SSO",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: "2030-06-15T12:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });

    it("rejects an entirely empty body", () => {
      const result = TaskInput.safeParse({});
      expect(result.success).toBe(false);
    });

    it("reports a title error when multiple fields are invalid", () => {
      const result = TaskInput.safeParse({ title: "", status: "NOPE" });
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join("."));
        expect(paths).toContain("title");
      }
    });
  });
});
