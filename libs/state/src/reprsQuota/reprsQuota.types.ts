export type ReprsQuotaState = {
  /** From API after GET /reprs: null = unlimited; undefined = not loaded (creates blocked). */
  maxReprsAllowed: number | null | undefined
  termsAcceptedAt?: string | null
  termsVersion?: string | null
  currentTermsVersion?: string | null
}
