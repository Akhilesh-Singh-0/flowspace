# auth.service

## Overview

The authentication service has a single responsibility: synchronizing a Clerk user into the local `User` table when a Clerk webhook fires. It is intentionally minimal — no session handling, no password logic, no profile merging. Clerk remains the authoritative identity provider; this service only mirrors the subset of identity data the API needs locally.

**Source:** [`apps/api/src/modules/auth/auth.service.ts`](../../apps/api/src/modules/auth/auth.service.ts)

## Dependencies

| Import | From | Purpose |
|---|---|---|
| `createUser` | `./auth.repository` | Inserts a row into the `User` table |
| `AppError` | `@/middleware/errorHandler` | Structured domain error with HTTP status |
| `Prisma` | `@prisma/client` | Used to narrow Prisma's known-request error type |

## Types

```ts
type UserInput = {
  clerkId: string;
  email: string;
  name: string;
}
```

## Exports

### `syncClerkUser(userInput: UserInput): Promise<User>`

**Description:** Creates a local `User` row from a Clerk identity payload.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `userInput.clerkId` | `string` | Clerk's stable user identifier (persisted in `User.clerkId`) |
| `userInput.email` | `string` | Primary email address from Clerk |
| `userInput.name` | `string` | Display name (Clerk webhook concatenates `first_name` and `last_name`) |

**Returns:** `Promise<User>` — the newly created Prisma `User` record (full row).

**Errors:**

| Condition | Thrown |
|---|---|
| Unique constraint violation (`Prisma.PrismaClientKnownRequestError` with `code === "P2002"`) | `AppError("User already exists", 409)` |
| Any other Prisma or runtime error | Re-thrown as-is (handled by the global `errorHandler`) |

**Implementation notes:**

- The service catches only `P2002` (unique constraint). All other `PrismaClientKnownRequestError` codes propagate unchanged.
- No validation is performed here — the Clerk webhook handler is the sole caller and Clerk payload shape is trusted.

**Usage example:**

```ts
// Called from clerkWebhookHandler on user.created events
const clerkId = payload.data.id;
const email = payload.data.email_addresses?.[0]?.email_address ?? "";
const name = `${payload.data.first_name} ${payload.data.last_name}`;

const user = await syncClerkUser({ clerkId, email, name });
```

## Caller

`syncClerkUser` is invoked exclusively by `clerkWebhookHandler` in [`apps/api/src/modules/auth/auth.controller.ts`](../../apps/api/src/modules/auth/auth.controller.ts). The handler only branches on `payload.type === "user.created"`. The `user.updated` and `user.deleted` Clerk event types currently return `200 OK` without running the service — this is a known limitation. See the Technical-Debt notes for the corresponding backlog item.

## Error handling

The service emits one domain error (`AppError("User already exists", 409)`). All other failures surface to the global `errorHandler` which converts:

- `AppError` → JSON envelope with the `AppError` status code and `code: "APP_ERROR"`.
- Unrecognized errors → `500` with `code: "INTERNAL_SERVER_ERROR"`.

## Related documentation

- [`docs/middleware/errorHandler`](../middleware/errorHandler.md) — global error translation.
- [`docs/api/README`](../api/README.md) — webhook endpoint reference.
