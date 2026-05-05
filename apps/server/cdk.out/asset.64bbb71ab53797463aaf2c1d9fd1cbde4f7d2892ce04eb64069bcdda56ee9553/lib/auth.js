"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = void 0;
const getUserId = (event) => {
    const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
    if (!userId || typeof userId !== 'string') {
        throw new Error('Missing user claim');
    }
    return userId;
};
exports.getUserId = getUserId;
//# sourceMappingURL=auth.js.map