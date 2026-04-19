# Environment variables and database client

## Overview

This page covers two tightly-coupled pieces of bootstrapping:

1. **Environment parsing** — how `process.env` is validated at boot via Zod (`apps/api/src/config/env.ts`).
2. **Prisma client singleton** — how the database connection is created once per process and re-used safely across hot reloads (`apps/api/src/lib/prisma.ts`).

The two modules are paired because the Prisma client depends on `DATABASE_URL`, and `DATABASE_URL` is validated here before anything else in the app can import it.

**Sources:**
- [`apps/api/src/config/env.ts`](../../apps/api/src/config/env.ts)
- [`apps/api/src/lib/prisma.ts`](../../apps/api/src/lib/prisma.ts)

## Boot flow

```
process.env
   │
   ▼
dotenv.config()          ← loads .env into process.env
   │
   ▼
envSchema.safeParse()    ← Zod validates required variables
   │
   ├─ success → export env = parsed.data
   │                        │
   │                        ▼
   │             import { env } from '@/config/env'
   │                        │
   │                        ▼
   │             env.DATABASE_URL → new PrismaClient()
   │                        │
   │                        ▼
   │             export prisma
   │
   └─ failure → console.error field errors → process.exit(1)
```

## Environment schema

`env.ts` defines and enforces the following schema on `process.env`:

```ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test'] as const).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_WEBHOOK_SECRET: z.string().min(1),
})
```

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | No | `development` | One of `development`, `production`, `test`. Controls the dev-mode auth bypass and the Prisma client cache. |
| `PORT` | No | `3000` | HTTP listen port (string — Zod does not coerce). |
| `DATABASE_URL` | **Yes** | — | Postgres connection string. Must parse as a URL. |
| `REDIS_URL` | **Yes** | — | Redis connection string for pub/sub and BullMQ. Must parse as a URL. |
| `CLERK_SECRET_KEY` | **Yes** | — | Non-empty string. Used by `authMiddleware.verifyToken`. |
| `CLERK_PUBLISHABLE_KEY` | **Yes** | — | Non-empty string. Consumed by the frontend build (shared env file). |
| `CLERK_WEBHOOK_SECRET` | **Yes** | — | Non-empty string. Used by `svix.Webhook` in the Clerk webhook handler. |

## Failure behavior

If any required variable is missing or malformed, `env.ts` prints the Zod `fieldErrors` and halts the process:

```ts
if (!parsed.success) {
    console.error("Invalid environmental variables:")
    console.error(parsed.error.flatten().fieldErrors)
    process.exit(1)
}
```

The API will **not boot** with an invalid environment; there is no fallback, no partial mode. Output example when `DATABASE_URL` is missing:

```
Invalid environmental variables:
{ DATABASE_URL: [ 'Required' ] }
```

## Exported `env` object

```ts
import { env } from "@/config/env"

env.DATABASE_URL   // string (URL-validated)
env.PORT           // string (defaults to '3000')
env.NODE_ENV       // 'development' | 'production' | 'test'
```

`env` is the single source of truth for configuration inside the API. Modules should import from `@/config/env` rather than reading `process.env` directly, so that all variables are typed and validated.

## Prisma singleton

`apps/api/src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
```

### Why the `globalThis` trick?

During development the API runs under `tsx`/`ts-node` with hot-reload. Each reload re-imports every module, which would normally instantiate a fresh `PrismaClient` on every change — each client opens its own pool, and Postgres hits its connection limit within seconds.

By caching the client on `globalThis`, the reloaded module re-uses the already-open client:

- **First import:** `globalForPrisma.prisma` is `undefined`; a new `PrismaClient` is created and cached.
- **Subsequent imports (dev):** `globalForPrisma.prisma` hits; the existing client is returned.
- **Production:** The cache-write is skipped (`NODE_ENV !== "production"` is false), so production always uses a single fresh client for the life of the process. Restarting the process creates a new one cleanly.

This pattern is standard for Prisma-on-Node hot-reload setups; it is described in the official Prisma documentation.

### Exported `prisma` client

```ts
import { prisma } from "@/lib/prisma"

await prisma.user.findUnique({ where: { clerkId } })
```

Every repository module (`*.repository.ts`) imports `prisma` from this file. There is no factory, no lazy init, no disconnect logic — the process-wide singleton is the contract.

## Integration with `authMiddleware`

`authMiddleware` reads `process.env.CLERK_SECRET_KEY` directly rather than going through the `env` export. The Zod schema still guarantees the value is present at boot, so the non-null assertion in `verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! })` is safe.

## Related documentation

- [`docs/guides/getting-started`](../guides/getting-started.md) — local env setup walkthrough.
- [`docs/architecture/database-er`](../architecture/database-er.md) — Prisma schema + ER diagram.
- [`docs/guides/deployment`](../guides/deployment.md) — production env variable checklist.
- [`docs/middleware/requireAuth`](../middleware/requireAuth.md) — consumer of `CLERK_SECRET_KEY`.
