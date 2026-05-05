"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateReprsHandler = exports.deleteReprHandler = exports.markReprPracticedHandler = exports.putReprHandler = exports.getReprsHandler = void 0;
const auth_1 = require("../lib/auth");
const http_1 = require("../lib/http");
const reprStore_1 = require("../lib/reprStore");
const reprValidation_1 = require("../lib/reprValidation");
const getReprsHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        const reprs = await (0, reprStore_1.listReprs)(userId);
        return (0, http_1.jsonResponse)(200, { reprs });
    }
    catch (error) {
        return (0, http_1.jsonResponse)(500, { message: error.message });
    }
};
exports.getReprsHandler = getReprsHandler;
const putReprHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        const payload = JSON.parse(event.body ?? '{}');
        const repr = (0, reprValidation_1.parseRepr)(payload);
        const pathReprId = event.pathParameters?.id;
        if (!pathReprId || pathReprId !== repr.id) {
            return (0, http_1.jsonResponse)(400, { message: 'Path id and repr id must match' });
        }
        await (0, reprStore_1.upsertRepr)(userId, repr);
        return (0, http_1.jsonResponse)(200, { repr });
    }
    catch (error) {
        return (0, http_1.jsonResponse)(400, { message: error.message });
    }
};
exports.putReprHandler = putReprHandler;
const markReprPracticedHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        const reprId = event.pathParameters?.id;
        if (!reprId) {
            return (0, http_1.jsonResponse)(400, { message: 'Missing repr id' });
        }
        const repr = await (0, reprStore_1.markPracticed)(userId, reprId);
        if (!repr) {
            return (0, http_1.jsonResponse)(404, { message: 'Not found' });
        }
        return (0, http_1.jsonResponse)(200, { repr });
    }
    catch (error) {
        return (0, http_1.jsonResponse)(400, { message: error.message });
    }
};
exports.markReprPracticedHandler = markReprPracticedHandler;
const deleteReprHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        const reprId = event.pathParameters?.id;
        if (!reprId) {
            return (0, http_1.jsonResponse)(400, { message: 'Missing repr id' });
        }
        await (0, reprStore_1.deleteRepr)(userId, reprId);
        return (0, http_1.jsonResponse)(200, { ok: true });
    }
    catch (error) {
        return (0, http_1.jsonResponse)(400, { message: error.message });
    }
};
exports.deleteReprHandler = deleteReprHandler;
const migrateReprsHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        const payload = JSON.parse(event.body ?? '[]');
        const reprs = (0, reprValidation_1.parseReprs)(payload);
        await (0, reprStore_1.replaceAllReprs)(userId, reprs);
        return (0, http_1.jsonResponse)(200, { imported: reprs.length });
    }
    catch (error) {
        return (0, http_1.jsonResponse)(400, { message: error.message });
    }
};
exports.migrateReprsHandler = migrateReprsHandler;
//# sourceMappingURL=reprs.js.map