"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const http_1 = require("../lib/http");
const reprs_1 = require("./reprs");
const handler = async (event) => {
    if (event.requestContext.http.method === 'GET' && event.rawPath === '/reprs') {
        return (0, reprs_1.getReprsHandler)(event);
    }
    if (event.requestContext.http.method === 'PUT' && event.rawPath.startsWith('/reprs/')) {
        return (0, reprs_1.putReprHandler)(event);
    }
    if (event.requestContext.http.method === 'POST' &&
        event.rawPath.startsWith('/reprs/') &&
        event.rawPath.endsWith('/practice')) {
        return (0, reprs_1.markReprPracticedHandler)(event);
    }
    if (event.requestContext.http.method === 'DELETE' &&
        event.rawPath.startsWith('/reprs/')) {
        return (0, reprs_1.deleteReprHandler)(event);
    }
    if (event.requestContext.http.method === 'POST' && event.rawPath === '/reprs/migrate') {
        return (0, reprs_1.migrateReprsHandler)(event);
    }
    return (0, http_1.jsonResponse)(404, { message: 'Not found' });
};
exports.handler = handler;
//# sourceMappingURL=router.js.map