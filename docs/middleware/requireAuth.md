# requireAuth (authMiddleware)

## Overview

`authMiddleware` verifies Clerk-issued JWTs on incoming requests and populates `req.user` with the Clerk subject (`userId`). Every authenticated route in the API sits behind this middleware.

**Source:** [`apps/api/src/middleware/requireAuth.ts`](../../apps/api/src/middleware/requireAuth.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `verifyToken` | `@clerk/backend` | Cryptographically verifies a Clerk JWT using `CLERK_SECRET_KEY` |
| `Request`, `Response`, `NextFunction` | `express` | Standard middleware types |

## Request augmentation

```ts
interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}
```

Downstream middleware and handlers can read `req.user!.userId` safely; if `authMiddleware` hasn't run (or didn't populate it), the handler will crash on the non-null assertion — so the middleware must come *before* any handler that depends on it.

## Exports

### `authMiddleware(req, res, next)`

**Signature:**

```ts
export const authMiddleware: (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>
```

## Behavior

The middleware runs three branches in order:

1. **Development short-circuit (security-critical):**
   If `process.env.NODE_ENV === "development"`, the middleware sets `req.user = { userId: "test-user-1" }` and calls `next()` **without verifying any JWT**.

    > ⚠️ **SECURITY WARNING:** In development mode there is **no authentication whatsoever**. Any request — with or without an `Authorization` header — is implicitly authenticated as the hard-coded user `"test-user-1"`. This makes local testing easy but makes the API unsafe to expose on any network while `NODE_ENV=development`. Ensure production deployments set `NODE_ENV=production`. Do not deploy with `NODE_ENV=development`.

2. **Header validation:**
   Reads `Authorization: Bearer <jwt>`. If the header is missing or does not start with `Bearer `, responds `401 UNAUTHORIZED`.

3. **Token verification:**
   Calls `verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })`. On success, sets `req.user = { userId: verified.sub }` and calls `next()`. On failure, branches on the error message:
   - Message contains `"JWT is expired"` → `401 TOKEN_EXPIRED` (`"Session expired, please login again"`).
   - Any other error → `401 UNAUTHORIZED` (`"Invalid token"`).

## Response shapes

All error responses use the standard API envelope.

**Missing / malformed header:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid token"
  }
}
```

**Expired JWT:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Session expired, please login again"
  }
}
```

**Invalid JWT (signature mismatch, malformed, wrong issuer, etc.):**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token"
  }
}
```

## Configuration

| Variable | Required | Effect |
|---|---|---|
| `NODE_ENV` | Yes | `"development"` activates the auth bypass. `"production"` / `"test"` enforce JWT verification. |
| `CLERK_SECRET_KEY` | Yes (non-dev) | Passed to `verifyToken`. Required in production. |

The `env.ts` module already enforces that `CLERK_SECRET_KEY` is present (Zod `.min(1)`), but the middleware itself reads `process.env.CLERK_SECRET_KEY!` directly.

## Usage

```ts
import express from "express"
import { authMiddleware } from "@/middleware/requireAuth"

const app = express()
app.use(authMiddleware)      // global

// Or per-router:
router.use(authMiddleware)
router.get("/me", (req, res) => {
  res.json({ userId: req.user!.userId })
})
```

## Cross-references

- [`docs/middleware/requireRole`](./requireRole.md) — role enforcement that runs **after** `authMiddleware` and relies on `req.user.userId`.
- [`docs/middleware/errorHandler`](./errorHandler.md) — the downstream error envelope for unhandled failures.
- [`docs/config/env-and-database`](../config/env-and-database.md) — `CLERK_SECRET_KEY` validation.
