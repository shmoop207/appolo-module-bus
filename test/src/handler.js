"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const index_1 = require("../../index");
let MessageHandler = /** @class */ (() => {
    let MessageHandler = class MessageHandler {
        handle(msg) {
        }
        replay(mes) {
            return { result: mes.body.test + "working" };
        }
    };
    tslib_1.__decorate([
        index_1.handler("Module.Test")
    ], MessageHandler.prototype, "handle", null);
    tslib_1.__decorate([
        index_1.reply("Request.Module.Test")
    ], MessageHandler.prototype, "replay", null);
    MessageHandler = tslib_1.__decorate([
        appolo_1.define(),
        appolo_1.singleton()
    ], MessageHandler);
    return MessageHandler;
})();
exports.MessageHandler = MessageHandler;
//# sourceMappingURL=handler.js.map