import { PermissionAllowedProps } from './typings'

// TODO: Remove any call to this function as we don't provide any authorization mechanism anymore with v13+
export const isOperationAllowed = (params: PermissionAllowedProps) => {
  const profile = params.user
  if (!profile) {
    return false
  }

  if (profile.isSuperAdmin) {
    return true
  }

  if (params.superAdmin) {
    return false
  }

  if (!params.operation || !params.resource) {
    return true
  }

  return true
}
