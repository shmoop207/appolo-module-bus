"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestError = void 0;
class RequestError extends Error {
    constructor(message, data) {
        super(message);
        this.data = data;
        Object.setPrototypeOf(this, RequestError.prototype);
    }
}
exports.RequestError = RequestError;
//# sourceMappingURL=requestError.js.map