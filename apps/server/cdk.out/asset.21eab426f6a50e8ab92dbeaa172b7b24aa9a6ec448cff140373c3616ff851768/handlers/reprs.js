"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateReprsHandler = exports.deleteReprHandler = exports.markReprPracticedHandler = exports.putReprHandler = exports.getReprsHandler = void 0;
const auth_1 = require("../lib/auth");
const analytics_1 = require("../lib/analytics");
const http_1 = require("../lib/http");
const reprStore_1 = require("../lib/reprStore");
const userConfig_1 = require("../lib/userConfig");
const reprValidation_1 = require("../lib/reprValidation");
const reprLimitExceededResponse = (maxReprsAllowed) => (0, http_1.jsonResponse)(403, {
    code: 'REPR_LIMIT_EXCEEDED',
    message: `You cannot create more than ${maxReprsAllowed} reprs.`,
    maxReprsAllowed,
});
const handleError = (error, options) => {
    if (error instanceof auth_1.UnauthorizedError) {
        return (0, http_1.jsonResponse)(401, { message: 'Unauthorized' });
    }
    return (0, http_1.jsonResponse)(options.defaultStatus, {
        message: options.defaultMessage,
    });
};
const getReprsHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        await (0, analytics_1.trackDailyUniqueUser)(userId);
        const [reprs] = await Promise.all([
            (0, reprStore_1.listReprs)(userId),
            (0, reprStore_1.getUserConfig)(userId),
        ]);
        return (0, http_1.jsonResponse)(200, { reprs });
    }
    catch (error) {
        return handleError(error, {
            defaultStatus: 500,
            defaultMessage: 'Internal server error',
        });
    }
};
exports.getReprsHandler = getReprsHandler;
const putReprHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        await (0, analytics_1.trackDailyUniqueUser)(userId);
        const payload = JSON.parse(event.body ?? '{}');
        const repr = (0, reprValidation_1.parseRepr)(payload);
        const pathReprId = event.pathParameters?.id;
        if (!pathReprId || pathReprId !== repr.id) {
            return (0, http_1.jsonResponse)(400, { message: 'Path id and repr id must match' });
        }
        const [alreadyExists, config] = await Promise.all([
            (0, reprStore_1.reprExists)(userId, repr.id),
            (0, reprStore_1.getUserConfig)(userId),
        ]);
        const maxReprsAllowed = (0, userConfig_1.resolveMaxReprsAllowed)(config);
        if (!alreadyExists && maxReprsAllowed !== null) {
            const count = await (0, reprStore_1.countReprsForUser)(userId);
            if (count >= maxReprsAllowed) {
                return reprLimitExceededResponse(maxReprsAllowed);
            }
        }
        const result = await (0, reprStore_1.upsertRepr)(userId, repr);
        (0, analytics_1.trackAction)(result === 'created' ? 'create' : 'edit');
        return (0, http_1.jsonResponse)(200, { repr });
    }
    catch (error) {
        return handleError(error, {
            defaultStatus: 400,
            defaultMessage: 'Bad request',
        });
    }
};
exports.putReprHandler = putReprHandler;
const markReprPracticedHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        await (0, analytics_1.trackDailyUniqueUser)(userId);
        const reprId = event.pathParameters?.id;
        if (!reprId) {
            return (0, http_1.jsonResponse)(400, { message: 'Missing repr id' });
        }
        const repr = await (0, reprStore_1.markPracticed)(userId, reprId);
        if (!repr) {
            return (0, http_1.jsonResponse)(404, { message: 'Not found' });
        }
        (0, analytics_1.trackAction)('practice');
        return (0, http_1.jsonResponse)(200, { repr });
    }
    catch (error) {
        return handleError(error, {
            defaultStatus: 400,
            defaultMessage: 'Bad request',
        });
    }
};
exports.markReprPracticedHandler = markReprPracticedHandler;
const deleteReprHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        await (0, analytics_1.trackDailyUniqueUser)(userId);
        const reprId = event.pathParameters?.id;
        if (!reprId) {
            return (0, http_1.jsonResponse)(400, { message: 'Missing repr id' });
        }
        await (0, reprStore_1.deleteRepr)(userId, reprId);
        (0, analytics_1.trackAction)('delete');
        return (0, http_1.jsonResponse)(200, { ok: true });
    }
    catch (error) {
        return handleError(error, {
            defaultStatus: 400,
            defaultMessage: 'Bad request',
        });
    }
};
exports.deleteReprHandler = deleteReprHandler;
const migrateReprsHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        await (0, analytics_1.trackDailyUniqueUser)(userId);
        const payload = JSON.parse(event.body ?? '[]');
        const reprs = (0, reprValidation_1.parseReprs)(payload);
        const config = await (0, reprStore_1.getUserConfig)(userId);
        const maxReprsAllowed = (0, userConfig_1.resolveMaxReprsAllowed)(config);
        if (maxReprsAllowed !== null && reprs.length > maxReprsAllowed) {
            return reprLimitExceededResponse(maxReprsAllowed);
        }
        await (0, reprStore_1.replaceAllReprs)(userId, reprs);
        return (0, http_1.jsonResponse)(200, { imported: reprs.length });
    }
    catch (error) {
        return handleError(error, {
            defaultStatus: 400,
            defaultMessage: 'Bad request',
        });
    }
};
exports.migrateReprsHandler = migrateReprsHandler;
//# sourceMappingURL=reprs.js.map