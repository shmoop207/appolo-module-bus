"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const index_1 = require("../../index");
let MessagePublisher = class MessagePublisher {
    async publish(test) {
        return { test };
    }
    async request(test) {
        return index_1.response({ test });
    }
};
tslib_1.__decorate([
    index_1.publisher("Module.Test")
], MessagePublisher.prototype, "publish", null);
tslib_1.__decorate([
    index_1.request("Request.Module.Test")
], MessagePublisher.prototype, "request", null);
MessagePublisher = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], MessagePublisher);
exports.MessagePublisher = MessagePublisher;
//# sourceMappingURL=publisher.js.map