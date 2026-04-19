# `auth.repository`

## Overview

The auth repository is a thin Prisma wrapper used by the Clerk webhook handler to materialise an application-side `User` row when Clerk emits a `user.created` event. It has exactly one export and no query helpers for reading users (lookup is done elsewhere via `user.repository`).

This module:

- Creates `User` rows from a Clerk webhook payload.
- Leaves `avatarUrl` unset (the model allows `null`); avatar hydration is not part of the webhook flow.
- Does not perform validation — the caller (`auth.controller`) is responsible for validating the Clerk payload before invoking `createUser`.

**Source:** [`apps/api/src/modules/auth/auth.repository.ts`](../../apps/api/src/modules/auth/auth.repository.ts)

## Internal Types

```ts
type user = {
  clerkId: string
  email: string
  name: string
}
```

### Naming note

The local type literal is declared in lowercase (`user`) rather than PascalCase (`UserInput`). This is inconsistent with the convention used by every other repository in the codebase (`TaskInput`, `ProjectInput`, `CreateWorkspaceInput`). A future cleanup PR should rename it to `UserInput`; this is a cosmetic/style issue only and has no runtime effect. Tracked in `Technical-Debt.md`.

## Exports

### `createUser(user)`

Creates a new `User` row from a Clerk webhook payload.

```ts
export const createUser = async (user: user) => Promise<User>
```

**Parameters**

| Name         | Type     | Description                                                                   |
| ------------ | -------- | ----------------------------------------------------------------------------- |
| `user`       | `user`   | Input object below.                                                           |
| `user.clerkId` | `string` | The external Clerk user ID (`data.id` from the Clerk webhook).              |
| `user.email` | `string` | Primary email address from Clerk's `email_addresses[0]`.                      |
| `user.name`  | `string` | Display name constructed by the controller from `first_name` + `last_name`.   |

**Returns**

`Promise<User>` — the newly created `User` row (full Prisma `User` model including `id`, `createdAt`, `updatedAt`, and a `null` `avatarUrl`).

**Throws**

- `PrismaClientKnownRequestError` with code `P2002` if `clerkId` or `email` already exists (both are `@unique` in `schema.prisma`).

**Example**

```ts
import { createUser } from '@/modules/auth/auth.repository'

const user = await createUser({
  clerkId: 'user_2abcDEF',
  email: 'alice@example.com',
  name: 'Alice Example',
})
// user.avatarUrl === null
```

## Related Files

- **Caller:** [`apps/api/src/modules/auth/auth.controller.ts`](../../apps/api/src/modules/auth/auth.controller.ts) — Clerk webhook handler.
- **Routes:** [`apps/api/src/modules/auth/auth.routes.ts`](../../apps/api/src/modules/auth/auth.routes.ts)
- **User lookup (separate file):** [`apps/api/src/lib/user.repository.ts`](../../apps/api/src/lib/user.repository.ts) — `findUserByClerkId` (note: documented bug — see `Technical-Debt.md`).
- **Schema:** [`apps/api/prisma/schema.prisma`](../../apps/api/prisma/schema.prisma) — `User` model.

## Cross-References

- [`docs/api/README.md`](../api/README.md) — webhook endpoint contract.
- [`docs/architecture/api-endpoint-map.md`](../architecture/api-endpoint-map.md)
- [`docs/modules-overview.md`](../modules-overview.md)
