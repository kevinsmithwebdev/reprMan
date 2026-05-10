export const RUN_GENESIS = 'SAGA/GENESIS'

export type RunGenesisPayload = {
  /** Clear category filters/lists before reload (use after a new sign-in). */
  afterSignIn?: boolean
}

export const runGenesisSaga = (payload?: RunGenesisPayload) => ({
  type: RUN_GENESIS,
  payload,
})
