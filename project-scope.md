# Project scope

## What this app is

An internal app for employees to order office equipment from a catalog. Built as a Power Apps Code App on top of three Dataverse tables: **products** (catalog), **orders** (one request header per user), and **orderlines** (the items + quantities on an order).

## Roles & permissions

Two roles:

- **User** — can read the product catalog, place orders, and see/edit *only their own* orders.
- **Admin** — can do everything: manage the catalog (add/edit/delete products) and see/edit/delete *all* orders.

Important: real permission enforcement lives in **Dataverse security roles**, not in the React UI. The app should hide/disable actions a user isn't allowed to do, but the source of truth is the table permissions. "Their own orders" is identified by matching the current user against `poc_requestedby` — the catalog stays read-only for users.

Admin is determined by a **Dataverse security role** (named **"Order Admin"**): the app checks it to toggle admin UI, and the same role grants the broader table permissions.

## Core flows (MVP)

**User**
1. Browse the catalog (only products marked available).
2. Build an order: pick products + quantities (an order = header + one or more order lines).
3. Submit the order (status → *Submitted*).
4. View their own orders and their status; edit/cancel an order *while it's still Submitted* (locked once an admin acts on it).

**Admin**
1. Manage catalog: add / edit / delete products.
2. View all orders.
3. Move an order through its status: *Submitted → Approved / Rejected → Assigned → Fulfilled*.

## Data model (already generated in `src/generated/`)

- **product**: name, category (Peripherals / Monitors / Laptops / Accessories / Furniture / Other), unit price, available (bool), description, image.
- **order**: requested-by, requested-date, status (Submitted / Approved / Assigned / Fulfilled / Rejected), notes.
- **orderline**: link to order, link to product, quantity.

## Out of scope (keeping it small)

- No payments, budgets, or approval chains (single admin approve/reject is enough).
- No stock/inventory tracking or quantity limits.
- No notifications/email.
- No reporting or dashboards.
- No editing orders after an admin has acted on them.
- No bulk import/export.

## Deferred (to revisit)

- **Product images.** The product table currently has only `poc_image` (a plain text/URL field, max 100 chars), not a true Dataverse Image column — so the catalog renders an image only if a URL is provided. Real file-upload images would require adding an **Image** column to the Product table in Dataverse, re-pulling the data source (`pac code add-data-source -t poc_product`), then building upload/preview UI (the pattern that already exists for `systemuser.entityimage`). Deferred until after the core ordering flow.

## Decisions (locked)

1. **Admin check** — a **Dataverse security role** (named **"Order Admin"**). The app reads the current user's roles to toggle admin UI; the role also carries the wider table permissions.
2. **Edit window** — users can edit/cancel an order **only while status = *Submitted***. Once an admin acts on it, it locks for the user (admin can still edit anything).
3. **Own orders** — identified by **`poc_requestedby` = current user**. On create, the app sets `poc_requestedby` to the logged-in user. (Note: this enables "order on behalf of" later, but for now requested-by is always the current user. Since row ownership is *not* the filter, make sure Dataverse permissions still restrict users to their own rows — or filter by `poc_requestedby` in queries and rely on role-level read scope.)
4. **Deleting a product** — no hard delete; set **`poc_available = false`** so it leaves the catalog but order history stays intact. (A true delete is reserved for products never used on an order.)
