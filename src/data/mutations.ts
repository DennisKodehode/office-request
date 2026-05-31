import { Poc_orderlinesService, Poc_ordersService, Poc_productsService } from '../generated'
import type { IOperationResult } from '@microsoft/power-apps/data'
import type { Poc_orders } from '../generated/models/Poc_ordersModel'
import type { Poc_orderlines } from '../generated/models/Poc_orderlinesModel'
import type { Poc_products } from '../generated/models/Poc_productsModel'
import { unwrap } from './useDataverseQuery'
import type { MutationResult } from './types'
import type { OrderStatus, ProductCategory } from './labels'

// Mutations are plain async functions (not hooks): components call them on a
// user action, await the result, then refetch the relevant query. Both helpers
// normalize success/failure into MutationResult so call sites never touch the
// raw IOperationResult envelope or try/catch.

async function run<T>(op: () => Promise<IOperationResult<T>>): Promise<MutationResult<T>> {
  try {
    return { ok: true, data: unwrap(await op()) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

async function runVoid(op: () => Promise<void>): Promise<MutationResult<void>> {
  try {
    await op()
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// Param types are derived straight from the generated service signatures, so
// they stay structurally identical to what the SDK expects (including under
// exactOptionalPropertyTypes) without redefining the field lists by hand.
// Friendly write-shape for products. We cast to the generated input at the
// service boundary because the option-set const+type name collision (see
// labels.ts) makes our ProductCategory not structurally match the generated
// poc_category type, and the generated input also marks system fields
// (ownerid/statecode) required, which Dataverse defaults for a Code App.
export interface ProductInput {
  poc_product1: string
  poc_category?: ProductCategory
  poc_available?: boolean
  poc_unitprice?: number
  poc_image?: string
  poc_description?: string
}

type ProductCreateInput = Parameters<typeof Poc_productsService.create>[0]
type ProductUpdateInput = Parameters<typeof Poc_productsService.update>[1]

// --- Products (Phase 3) ---

export function createProduct(record: ProductInput): Promise<MutationResult<Poc_products>> {
  return run(() => Poc_productsService.create(record as unknown as ProductCreateInput))
}

export function updateProduct(
  id: string,
  changes: Partial<ProductInput>,
): Promise<MutationResult<Poc_products>> {
  return run(() =>
    Poc_productsService.update(id, changes as unknown as ProductUpdateInput),
  )
}

/** Soft-delete: hide a product from the catalog without removing history. */
export function setProductAvailability(
  id: string,
  available: boolean,
): Promise<MutationResult<Poc_products>> {
  return run(() => Poc_productsService.update(id, { poc_available: available }))
}

// --- Orders (Phase 4 / 5) ---

// The generated create() input marks system fields (ownerid/owneridtype/
// statecode) as required, but Dataverse defaults the owner to the current user
// in a Code App, so app code supplies only the meaningful fields. Cast at the
// service boundary; Phase 4 verifies at runtime whether any system field is
// actually required (add it here if Dataverse rejects the create).
type NewOrder = {
  poc_requestedby: string
  poc_status: OrderStatus
  poc_requesteddate?: string
  poc_notes?: string
}

type OrderCreateInput = Parameters<typeof Poc_ordersService.create>[0]
type OrderUpdateInput = Parameters<typeof Poc_ordersService.update>[1]
type OrderLineCreateInput = Parameters<typeof Poc_orderlinesService.create>[0]

export function createOrder(record: NewOrder): Promise<MutationResult<Poc_orders>> {
  return run(() => Poc_ordersService.create(record as unknown as OrderCreateInput))
}

export function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<MutationResult<Poc_orders>> {
  // poc_status (a const+type same-name option-set) mis-resolves to `undefined`
  // inside the generated update input under verbatimModuleSyntax; cast past it.
  const changes = { poc_status: status } as unknown as OrderUpdateInput
  return run(() => Poc_ordersService.update(id, changes))
}

export function deleteOrder(id: string): Promise<MutationResult<void>> {
  return runVoid(() => Poc_ordersService.delete(id))
}

// --- Order lines (Phase 4) ---
// @odata.bind paths use the entity SET name (from power.config.json:
// poc_orders / poc_products — regular pluralization here, not irregular).

export function createOrderLine(
  orderId: string,
  productId: string,
  quantity: number,
): Promise<MutationResult<Poc_orderlines>> {
  return run(() =>
    Poc_orderlinesService.create({
      'poc_Order@odata.bind': `/poc_orders(${orderId})`,
      'poc_Product@odata.bind': `/poc_products(${productId})`,
      poc_quantity: quantity,
    } as unknown as OrderLineCreateInput),
  )
}
