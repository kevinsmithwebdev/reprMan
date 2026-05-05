"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonResponse = void 0;
const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: {
        'content-type': 'application/json',
    },
    body: JSON.stringify(body),
});
exports.jsonResponse = jsonResponse;
//# sourceMappingURL=http.js.map