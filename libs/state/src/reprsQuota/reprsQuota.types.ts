export type ReprsQuotaState = {
  /** From API after GET /user/config: null = unlimited; undefined = not loaded. */
  maxReprsAllowed: number | null | undefined
  subscription?: import('@reprman/shared/subscription').Subscription
  termsAcceptedAt?: string | null
  termsVersion?: string | null
  currentTermsVersion?: string | null
}
