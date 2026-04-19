# Request ID and Error Handler Middleware

## Overview

Two cross-cutting Express middlewares that bracket almost every API request:

- **`requestId`** — assigns or forwards an `x-request-id` header so every log line and error response can be correlated to a single request.
- **`errorHandler`** — the terminal error middleware. Must be registered *last* so Express routes all `next(err)` calls to it. It converts known exception types into the project's standard JSON error envelope and falls back to a generic `500` for anything else. The `AppError` class used throughout the service layer is exported from this same file.

**Sources**

- [`apps/api/src/middleware/requestId.ts`](../../apps/api/src/middleware/requestId.ts)
- [`apps/api/src/middleware/errorHandler.ts`](../../apps/api/src/middleware/errorHandler.ts)

---

## `requestId` Middleware

### Export

#### `requestId(req, res, next)`

```ts
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void
```

**Behaviour**

1. Reads `req.headers['x-request-id']`. If absent or falsy, generates a new ID via `randomUUID()` from Node's `crypto` module.
2. Writes the value back onto `req.headers['x-request-id']` (so downstream middleware can read it without re-checking for presence).
3. Sets the same value as the response header (`x-request-id`) so clients can correlate.
4. Calls `next()` with no error.

### Registration

Registered in `createApp()` (see [`apps/api/src/app.ts`](../../apps/api/src/app.ts)) immediately after body-parsing and before any route, so every request — including errors raised by auth or validation middleware — has a request id available.

Order excerpt from `app.ts`:

```ts
app.use(helmet())
app.use(cors())
app.use('/auth/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(requestId)       // ← here
app.use('/auth', webhookRoute)
// …workspace / project / task / comment / label routers…
app.use(errorHandler)    // ← terminal
```

---

## `errorHandler` Middleware

### Export

#### `errorHandler(err, req, res, next)`

```ts
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => Response
```

The function signature has four parameters so Express recognises it as an error-handling middleware. `next` is accepted but unused.

### Response Envelope

Every response this middleware emits uses the same shape:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "...", "message": "..." },
  "requestId": "..."
}
```

`requestId` is read from `req.headers['x-request-id']` — populated upstream by the `requestId` middleware. For `VALIDATION_ERROR` responses a `fields` object is also included inside `error`.

### Error Branches

The middleware dispatches on `err`'s concrete type in the following order:

#### 1. `ZodError` → `400 VALIDATION_ERROR`

Validation errors from Zod schemas (raised by the `validate` middleware on invalid bodies/params/queries).

- Iterates `err.issues` and builds a `fields` record keyed by the first segment of each `issue.path` (joined with `.`). Only the **first error per field** is retained.
- Responds with:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "fields": { "title": "Required", "slug": "Must be lowercase" }
  },
  "requestId": "..."
}
```

#### 2. `PrismaClientKnownRequestError` (code `P2002`) → `409 CONFLICT`

Prisma's unique-constraint violation.

```json
{
  "success": false,
  "data": null,
  "error": { "code": "CONFLICT", "message": "Resource already exists" },
  "requestId": "..."
}
```

#### 3. `AppError` → `err.statusCode APP_ERROR`

Any `AppError` thrown by a service is surfaced with its own `statusCode` and its own message.

```json
{
  "success": false,
  "data": null,
  "error": { "code": "APP_ERROR", "message": "<err.message>" },
  "requestId": "..."
}
```

#### 4. Anything else → `500 INTERNAL_SERVER_ERROR`

Unknown errors are logged first (with message and stack if the error is an `Error`), then:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "INTERNAL_SERVER_ERROR", "message": "Something went wrong" },
  "requestId": "..."
}
```

### `AppError` Class

```ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message)
  }
}
```

Used throughout the service layer for custom-coded throws:

```ts
throw new AppError('Workspace must have at least one owner', 400)
throw new AppError('Only workspace owners can delete projects', 403)
throw new AppError('Task not found', 404)
```

The error handler matches it by `instanceof AppError`, so any code that imports from `@/middleware/errorHandler` and throws a new `AppError` will be mapped correctly.

### Known Limitation — 401 responses

The error handler **does not currently handle `UNAUTHORIZED` or `TOKEN_EXPIRED`**. Those `401` responses are emitted **directly by `authMiddleware`** in [`apps/api/src/middleware/requireAuth.ts`](../../apps/api/src/middleware/requireAuth.ts) — the auth middleware returns `res.status(401).json(...)` inline instead of calling `next(err)`. Consumers diagnosing `401`s should therefore look at the auth middleware, not this file. The envelope shape used by `requireAuth` is intentionally compatible (same top-level keys) but does **not** include `requestId` today.

## Cross-References

- [`docs/middleware/validate.md`](./validate.md)
- [`docs/middleware/requireAuth.md`](./requireAuth.md)
- [`docs/api/README.md`](../api/README.md) — error response documentation.
- [`docs/modules-overview.md`](../modules-overview.md)
