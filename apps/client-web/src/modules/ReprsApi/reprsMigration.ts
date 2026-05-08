import { Reprs } from 'types'
import { LocalStorageModule } from 'modules'
import ReprsApiModule from './ReprsApi.module'

const MIGRATION_PREFIX = 'reprsCloudMigrationDone'

const migrationKeyForUser = (userId: string) => `${MIGRATION_PREFIX}:${userId}`

const getUserIdFromToken = async (): Promise<string | null> => {
  try {
    const { fetchAuthSession } = await import('aws-amplify/auth')
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.payload?.sub ?? null
  } catch {
    return null
  }
}

export const tryMigrateLocalReprsOnce = async (
  cloudReprs: Reprs
): Promise<void> => {
  const userId = await getUserIdFromToken()
  if (!userId) return

  const migrationKey = migrationKeyForUser(userId)
  if (localStorage.getItem(migrationKey) === 'true') return
  if (cloudReprs.length > 0) {
    localStorage.setItem(migrationKey, 'true')
    return
  }

  const localReprs = await LocalStorageModule.getInstance().getReprs()
  if (localReprs.length === 0) {
    localStorage.setItem(migrationKey, 'true')
    return
  }

  await ReprsApiModule.getInstance().migrateReprs(localReprs)
  localStorage.setItem(migrationKey, 'true')
}
