"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMaxReprsAllowed = exports.keyForUserConfig = exports.USER_CONFIG_SORT_KEY = exports.DEFAULT_MAX_REPRS_ALLOWED = void 0;
const rawDefault = process.env.DEFAULT_MAX_REPRS_ALLOWED ?? '25';
const parsed = Number(rawDefault);
exports.DEFAULT_MAX_REPRS_ALLOWED = Number.isFinite(parsed) && parsed >= 0 ? parsed : 25;
exports.USER_CONFIG_SORT_KEY = 'CONFIG';
const keyForUserConfig = (userId) => ({
    pk: `USER#${userId}`,
    sk: exports.USER_CONFIG_SORT_KEY,
});
exports.keyForUserConfig = keyForUserConfig;
/**
 * Resolved quota for API and enforcement.
 * - number: hard cap
 * - null: unlimited (explicit null in DynamoDB)
 */
function resolveMaxReprsAllowed(item) {
    if (!item || !Object.prototype.hasOwnProperty.call(item, 'maxReprsAllowed')) {
        return exports.DEFAULT_MAX_REPRS_ALLOWED;
    }
    if (item.maxReprsAllowed === null) {
        return null;
    }
    return item.maxReprsAllowed;
}
exports.resolveMaxReprsAllowed = resolveMaxReprsAllowed;
//# sourceMappingURL=userConfig.js.map