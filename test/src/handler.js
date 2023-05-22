"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const index_1 = require("../../index");
let MessageHandler = class MessageHandler {
    handle(msg) {
    }
    replay(mes) {
        return { result: mes.body.test + "working" };
    }
    replay2(mes) {
        return { result: mes.body.test + "working" };
    }
};
tslib_1.__decorate([
    (0, index_1.handler)("Module.Test", { retry: { retires: 1 } })
], MessageHandler.prototype, "handle", null);
tslib_1.__decorate([
    (0, index_1.reply)("Request.Module.Test")
], MessageHandler.prototype, "replay", null);
tslib_1.__decorate([
    (0, index_1.reply)(() => "Request.Module.Test2")
], MessageHandler.prototype, "replay2", null);
MessageHandler = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], MessageHandler);
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=handler.js.map