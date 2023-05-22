"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagePublisher = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const index_1 = require("../../index");
let MessagePublisher = class MessagePublisher extends index_1.Publisher {
    async publishMethod(test) {
        return (0, index_1.params)({ test });
    }
    async requestMethod(test) {
        return (0, index_1.params)({ test });
    }
};
tslib_1.__decorate([
    (0, index_1.publisher)("Module.Test")
], MessagePublisher.prototype, "publishMethod", null);
tslib_1.__decorate([
    (0, index_1.request)("Request.Module.Test")
], MessagePublisher.prototype, "requestMethod", null);
MessagePublisher = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], MessagePublisher);
exports.MessagePublisher = MessagePublisher;
//# sourceMappingURL=publisher.js.map