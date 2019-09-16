"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const appolo_1 = require("appolo");
exports.HandlerSymbol = "__HandlerSymbol__";
exports.PublisherSymbol = "__PublisherSymbol__";
exports.RequestSymbol = "__RequestSymbol__";
exports.ReplySymbol = "__ReplySymbol__";
function defineHandler(eventName, options, symbol) {
    return function (target, propertyKey, descriptor) {
        let data = appolo_1.Util.getReflectData(symbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                events: [],
                propertyKey,
                descriptor
            };
        }
        data[propertyKey].events.push({ eventName, options: options || {} });
    };
}
function definePublisher(eventName, symbol, options) {
    return function (target, propertyKey, descriptor) {
        let data = appolo_1.Util.getReflectData(symbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventName,
                propertyKey,
                options,
                descriptor
            };
        }
    };
}
function handler(eventName, options) {
    return defineHandler(eventName, options, exports.HandlerSymbol);
}
exports.handler = handler;
function reply(eventName, options) {
    return defineHandler(eventName, options, exports.ReplySymbol);
}
exports.reply = reply;
function publisher(eventName, options) {
    return definePublisher(eventName, exports.PublisherSymbol, options);
}
exports.publisher = publisher;
function request(eventName, options) {
    return definePublisher(eventName, exports.RequestSymbol, options);
}
exports.request = request;
//# sourceMappingURL=decorators.js.map