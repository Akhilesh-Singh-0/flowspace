# validate

## Overview

`validate` is a Zod body-only validation middleware factory. It parses `req.body` against the supplied schema, re-assigns the parsed (and potentially transformed) value back onto `req.body`, and forwards any `ZodError` to the global [`errorHandler`](./errorHandler.md) for envelope formatting.

**Source:** [`apps/api/src/middleware/validate.ts`](../../apps/api/src/middleware/validate.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `Request`, `Response`, `NextFunction`, `RequestHandler` | `express` | Standard middleware types |
| `z` | `zod` | Schema validation and error type |

## Exports

### `validate(schema: z.ZodSchema): RequestHandler`

**Signature:**

```ts
export const validate: (schema: z.ZodSchema) => RequestHandler
```

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `schema` | `z.ZodSchema` | Any Zod schema to parse `req.body` with |

**Returns:** A standard Express middleware `(req, _res, next) => void`.

## Behavior

1. Calls `schema.parse(req.body)`.
2. Assigns the parsed result **back to** `req.body` (replacing the original body).
3. Calls `next()` on success, or `next(err)` on any thrown error (in practice, `ZodError`).

Because `schema.parse` applies transformations (`.trim()`, `.toLowerCase()`, `.default()`, `.coerce.*`, etc.), downstream handlers see the **coerced / transformed** values, not the raw client input. For example, `ProjectInput` applies `.trim().toLowerCase()` to `title`, so by the time the project service runs, the title is already normalized.

## Important limitations

- ❌ **Body-only.** `validate` does not read `req.params` or `req.query`. URL-parameter or query-string validation must be implemented separately (today this is done ad hoc in controllers).
- ❌ **Mutates `req.body`.** The original request body is replaced by the parsed/transformed value. If downstream code needs the raw input, capture it before `validate` runs.

## Error emission

Zod failures surface as `ZodError` instances. The global `errorHandler` detects these and converts them into a `400` response with a `fields` object mapping field path → first error message. Example response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "fields": {
      "title": "String must contain at least 1 character(s)",
      "color": "Invalid hex color"
    }
  },
  "requestId": "..."
}
```

Any non-`ZodError` thrown during parsing (rare — for example, a custom `.refine` that throws) falls through to the generic error branch and becomes a `500`.

## Usage

```ts
import { validate } from "@/middleware/validate"
import { ProjectInput } from "@/modules/projects/project.schema"

router.post(
  "/workspaces/:id/projects",
  authMiddleware,
  requireRole("OWNER", "ADMIN", "MEMBER"),
  validate(ProjectInput),            // runs after auth/role, before the handler
  createProjectHandler,
)
```

Inside the handler, `req.body` is typed as `z.infer<typeof ProjectInput>` (in practice, `ProjectInputType` is exported alongside the schema for exactly this use).

## Cross-references

- [`docs/middleware/errorHandler`](./errorHandler.md) — converts `ZodError` into the `VALIDATION_ERROR` envelope.
- [`docs/middleware/requireAuth`](./requireAuth.md) and [`docs/middleware/requireRole`](./requireRole.md) — typically run before `validate`.
- Every route module under `apps/api/src/modules/*/` exports a `*.schema.ts` file that pairs with `validate`.
