"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserConfigHandler = void 0;
const auth_1 = require("../lib/auth");
const http_1 = require("../lib/http");
const reprStore_1 = require("../lib/reprStore");
const userConfig_1 = require("../lib/userConfig");
const getUserConfigHandler = async (event) => {
    try {
        const userId = (0, auth_1.getUserId)(event);
        const config = await (0, reprStore_1.getUserConfig)(userId);
        const maxReprsAllowed = (0, userConfig_1.resolveMaxReprsAllowed)(config);
        return (0, http_1.jsonResponse)(200, { maxReprsAllowed });
    }
    catch (error) {
        if (error instanceof auth_1.UnauthorizedError) {
            return (0, http_1.jsonResponse)(401, { message: 'Unauthorized' });
        }
        return (0, http_1.jsonResponse)(500, { message: 'Internal server error' });
    }
};
exports.getUserConfigHandler = getUserConfigHandler;
//# sourceMappingURL=userConfig.js.map