# Implementation plan

Scope and rules live in `project-scope.md`. This is the build order to get from the current Vite starter to the MVP. Keep it small — don't pull in anything from the "out of scope" list.

Guiding principles:
- UI only **hides/disables**; Dataverse security roles do the real enforcement.
- All data access goes through the generated `Poc_*Service` classes — never call the SDK directly from components.
- Ship phase by phase; each phase should `npm run build` clean and be demoable.

---

## Phase 0 — Bootstrap the Power Apps app shell

The app is never wired to Power Apps today, so no Dataverse call would work.

- Bootstrap the Power Apps context in `src/main.tsx` before mounting React. The `@microsoft/power-apps/app` module surface is **`setConfig`** and **`getContext(): Promise<IContext>`** — there is **no** `initialize` export and **no** `PowerProvider` component to wrap. Follow the current Power Apps Code Apps quickstart for the exact call sequence and confirm against the official docs; the `powerApps()` Vite plugin handles the rest of the wiring. Render a loading state until context is ready.
- Strip the starter content from `src/App.tsx` (counter, logos) down to an empty shell.
- Add minimal routing/layout (see Phase 4) stubs as needed.

**Done when:** app loads inside Power Apps with an empty shell and one successful Dataverse read (e.g. log `Poc_productsService.getAll()`).

---

## Phase 1 — Identity & role context

- Get the current user from `getContext()` (`@microsoft/power-apps/app`), which resolves `IContext.user: { fullName?, objectId?, tenantId?, userPrincipalName? }`. Use **`user.objectId`** (the Entra/AAD object id — stable) as the identity key; keep `fullName` for display. Note this is the Entra object id, **not** the Dataverse `systemuserid`. Expose it through a `useCurrentUser()` hook / context for one consistent access point.
  - Implication for "own orders": `poc_requestedby` is a free-text string column, so on order create store `user.objectId` into it and filter `useMyOrders()` by that same value — identity in and identity out stay consistent.
- Determine **admin** from the "Office Request Admin" Dataverse security role.
  - ⚠️ **Risk / spike:** there is no direct "my roles" call. Options, smallest first:
    1. `client.executeAsync(...)` (on the data client from `getClient`) a Dataverse request to read the current user's roles (e.g. WhoAmI → user roles), check for the admin role name.
    2. Add `roles` / `systemuserroles` as data sources and query them through generated services.
  - Pick option 1 if the executeAsync request is straightforward; otherwise 2. Timebox this — if it gets heavy, fall back to a temporary hardcoded admin allow-list behind the same `useIsAdmin()` interface so UI work isn't blocked.
- Expose a `useIsAdmin(): boolean` hook backed by the above. Everything else consumes this hook, so the resolution mechanism can change without touching components.

**Done when:** `useCurrentUser()` and `useIsAdmin()` return correct values; switching accounts flips admin UI.

---

## Phase 2 — Data access hooks

Thin wrappers over the generated services so components stay declarative and loading/error handling is consistent.

- `useProducts()` — list available products (filter `poc_available = true` for users; admins see all).
- `useMyOrders()` — orders where `poc_requestedby = current user`; `useAllOrders()` for admin.
- `useOrder(id)` — single order + its order lines (query `orderlines` filtered by the order lookup).
- Small `mutateX` helpers wrapping `create/update/delete`.
- Centralize result-unwrapping (`IOperationResult`) and surface errors in one place.

**Done when:** hooks return typed data and basic loading/error states; no component imports a `Poc_*Service` directly.

---

## Phase 3 — Catalog (products)

- **User view:** browse available products (name, category, price, image, description). Read-only. Category filter is fine; search is optional.
- **Admin view:** add / edit products; "delete" = soft delete (`poc_available = false`). Hard delete only allowed when the product is on no order line (skip the hard-delete UI entirely if simpler).

**Done when:** users see a read-only catalog; admins can add/edit and toggle availability.

---

## Phase 4 — Ordering flow (cart → order + lines)

The core feature. An order = one `poc_order` header + one or more `poc_orderline` rows.

- Client-side "cart": pick products + quantities (in component state — no draft persisted to Dataverse).
- On submit:
  1. Create the `poc_order` with `poc_requestedby` = current user, `poc_status` = `Submitted`, `poc_requesteddate` = now, optional notes.
  2. Create a `poc_orderline` per cart item, linking via `"poc_Order@odata.bind"` and `"poc_Product@odata.bind"` with quantity.
  - ⚠️ No multi-row transaction here — create header first, then lines; handle partial-failure (e.g. surface an error and let the user retry/clean up). Keep it simple but don't pretend it's atomic.

**Done when:** a user can build a cart and submit it, producing one order with correct lines.

---

## Phase 5 — Orders: view & manage

- **User — "My orders":** list own orders with status; open one to see its lines. Edit/cancel allowed **only while `Submitted`** (gate every edit/cancel control on status). Editing = adjust lines/quantities/notes; cancel = delete or a terminal state (use delete unless a "Cancelled" status is added to scope).
- **Admin — "All orders":** see every order, open detail, change status along `Submitted → Approved / Rejected → Assigned → Fulfilled`, and edit anything.

**Done when:** users manage only their Submitted orders; admins drive status for all orders, and locked orders are read-only to users.

---

## Phase 6 — Navigation & layout

Structural wiring only — get every screen reachable and the app shell coherent. Visual craft is deferred to Phase 7 (polish a complete app, not stubs).

- Role-gated nav: Catalog + My Orders for everyone; Manage Catalog + All Orders for admins (`useIsAdmin()`).
- A consistent app-shell layout (header + nav + content) wrapping all features.
- Consistent loading / empty / error states across screens.
- `npm run build` + `npm run lint` clean.

**Done when:** the four locked flows are reachable and work end to end with role-appropriate navigation.

---

## Phase 7 — Design & polish

The dedicated visual pass. Done **last, on purpose** — every feature screen (Phases 3–5) and the navigation shell (Phase 6) now exist, so we polish the *real, complete* app instead of placeholders, and one cohesive design language can be applied across all screens at once. Use the `frontend-design` skill here.

- Establish a small design system: color/spacing/typography tokens + shared button/input/badge/card primitives (refactor the per-feature CSS to use them).
- Raise visual quality across catalog, cart/order, and order-management screens: hierarchy, spacing, empty/loading/error states, hover/focus/disabled states, subtle transitions.
- Responsive layout (mobile → desktop) and an accessibility pass (labels, focus order, keyboard nav, color contrast, dialog focus-trap).
- Stay plain-CSS / no heavy UI dependency unless the user opts in; keep within `project-scope.md`.

**Done when:** the app looks production-grade and consistent across every screen and breakpoint, and `npm run build` + `npm run lint` are clean.

---

## Cross-cutting notes

- **Security reminder:** because "own orders" is filtered by `poc_requestedby` (not row owner), make sure Dataverse read permissions actually restrict users to their rows — UI filtering alone is not security. Confirm with the security role config. (See the caveat in `project-scope.md`.)
- **No tests configured** — verify by running the app (`npm run dev`) per phase. Add a test runner only if scope grows.
- **Suggested ordering if time-boxed:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7. Phases 3 and 4 are the most user-visible; Phase 1's role spike is the main unknown — resolve it early. Phase 7 (design & polish) is deliberately last so it operates on the complete app; do per-phase styling only "good enough", then make it cohesive in 7.
