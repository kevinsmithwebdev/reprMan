"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = exports.UnauthorizedError = void 0;
class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
const getUserId = (event) => {
    const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
    if (!userId || typeof userId !== 'string') {
        throw new UnauthorizedError();
    }
    return userId;
};
exports.getUserId = getUserId;
//# sourceMappingURL=auth.js.map