"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const appolo_1 = require("appolo");
exports.HandlerSymbol = Symbol("HandlerSymbol");
exports.PublisherSymbol = Symbol("PublisherSymbol");
exports.RequestSymbol = Symbol("RequestSymbol");
exports.ReplySymbol = Symbol("ReplySymbol");
function defineHandler(eventName, symbol) {
    return function (target, propertyKey, descriptor) {
        let data = appolo_1.Util.getReflectData(symbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }
        data[propertyKey].eventNames.push(eventName);
    };
}
function definePublisher(eventName, symbol, expire) {
    return function (target, propertyKey, descriptor) {
        let data = appolo_1.Util.getReflectData(symbol, target.constructor, {});
        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventName,
                propertyKey,
                expire,
                descriptor
            };
        }
    };
}
function handler(eventName) {
    return defineHandler(eventName, exports.HandlerSymbol);
}
exports.handler = handler;
function reply(eventName) {
    return defineHandler(eventName, exports.ReplySymbol);
}
exports.reply = reply;
function publisher(eventName, expire) {
    return definePublisher(eventName, exports.PublisherSymbol, expire);
}
exports.publisher = publisher;
function request(eventName, expire) {
    return definePublisher(eventName, exports.RequestSymbol, expire);
}
exports.request = request;
//# sourceMappingURL=decorators.js.map