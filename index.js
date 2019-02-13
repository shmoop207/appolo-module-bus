"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var busProvider_1 = require("./module/src/bus/busProvider");
exports.BusProvider = busProvider_1.BusProvider;
var decorators_1 = require("./module/src/common/decorators");
exports.reply = decorators_1.reply;
exports.request = decorators_1.request;
exports.publisher = decorators_1.publisher;
exports.handler = decorators_1.handler;
var busModule_1 = require("./module/busModule");
exports.BusModule = busModule_1.BusModule;
function response(data) {
    return data;
}
exports.response = response;
//# sourceMappingURL=index.js.map