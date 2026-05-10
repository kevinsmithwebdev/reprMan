export declare const DEFAULT_MAX_REPRS_ALLOWED: number;
export declare type UserConfigItem = {
    pk: string;
    sk: string;
    maxReprsAllowed?: number | null;
};
/**
 * Resolved quota for API and enforcement.
 * - number: hard cap
 * - null: unlimited (explicit null in DynamoDB)
 */
export declare function resolveMaxReprsAllowed(item: UserConfigItem | null | undefined): number | null;
/**
 * Normalizes the raw `maxReprsAllowed` field as returned by the user-config
 * API. Used by the client to interpret the response shape.
 *
 * - explicit `null` -> unlimited
 * - finite number -> that cap
 * - anything else (`undefined`, missing, non-number) -> `undefined`
 */
export declare const parseMaxReprsAllowed: (raw: unknown) => number | null | undefined;
