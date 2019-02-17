"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
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
    appolo_1.define(),
    appolo_1.singleton()
], MessagePublisher);
exports.MessagePublisher = MessagePublisher;
//# sourceMappingURL=publisher.js.map