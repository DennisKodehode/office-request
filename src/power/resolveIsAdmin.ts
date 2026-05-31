import { SystemusersService } from '../generated'

/** Dataverse security role that grants admin capabilities in this app. */
export const ADMIN_ROLE_NAME = 'Order Admin'

/**
 * Resolves whether the signed-in user holds the admin Dataverse security role,
 * keyed on their Entra object id (`getContext().user.objectId`).
 *
 * Single query against the `systemuser` data source. The SDK's options have no
 * `$expand`, so the role test lives inside the OData `filter` lambda on the
 * user↔role N:N navigation property (`systemuserroles_association`):
 *   - match the user by `azureactivedirectoryobjectid`
 *   - require any associated role whose `name` equals ADMIN_ROLE_NAME
 *
 * If this lambda turns out to be unsupported in the environment (the result
 * comes back `!success`), the fallback is the multi-table approach: add the
 * `systemuserroles`/`role` data sources and resolve in two steps. The caller
 * (PowerProvider) treats any throw/false as non-admin, so failures never lock a
 * normal user out of the app.
 */
export async function resolveIsAdmin(objectId: string | undefined): Promise<boolean> {
  if (!objectId) return false

  const result = await SystemusersService.getAll({
    top: 1,
    select: ['systemuserid'],
    filter:
      `azureactivedirectoryobjectid eq '${objectId}' ` +
      `and systemuserroles_association/any(x:x/name eq '${ADMIN_ROLE_NAME}')`,
  })

  return result.success && result.data.length > 0
}
