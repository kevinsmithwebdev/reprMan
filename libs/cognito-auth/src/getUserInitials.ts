import { User } from '@reprman/state/user/user.types'

/** Two-letter initials for avatar display. */
export function getUserInitials(user: User): string {
  const fromName = user.name?.trim()
  if (fromName) {
    const parts = fromName.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts.at(-1)?.[0] ?? ''}`.toUpperCase()
    }
    return fromName.slice(0, 2).toUpperCase()
  }
  const local = user.email.split('@')[0] || user.email
  return local.slice(0, 2).toUpperCase() || '?'
}
