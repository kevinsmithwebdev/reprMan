export type ReprsQuotaState = {
  /** From API after GET /reprs: null = unlimited; undefined = not loaded (creates blocked). */
  maxReprsAllowed: number | null | undefined
}
