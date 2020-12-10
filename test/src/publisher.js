"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagePublisher = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const index_1 = require("../../index");
let MessagePublisher = class MessagePublisher extends index_1.Publisher {
    async publishMethod(test) {
        return index_1.params({ test });
    }
    async requestMethod(test) {
        return index_1.params({ test });
    }
};
tslib_1.__decorate([
    index_1.publisher("Module.Test")
], MessagePublisher.prototype, "publishMethod", null);
tslib_1.__decorate([
    index_1.request("Request.Module.Test")
], MessagePublisher.prototype, "requestMethod", null);
MessagePublisher = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], MessagePublisher);
exports.MessagePublisher = MessagePublisher;
//# sourceMappingURL=publisher.js.map