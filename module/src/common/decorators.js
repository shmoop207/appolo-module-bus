"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = exports.publisher = exports.reply = exports.handler = exports.ReplySymbol = exports.RequestSymbol = exports.PublisherSymbol = exports.HandlerSymbol = void 0;
require("reflect-metadata");
const utils_1 = require("@appolo/utils");
exports.HandlerSymbol = "__HandlerSymbol__";
exports.PublisherSymbol = "__PublisherSymbol__";
exports.RequestSymbol = "__RequestSymbol__";
exports.ReplySymbol = "__ReplySymbol__";
function defineHandler(eventName, options, symbol) {
    return function (target, propertyKey, descriptor) {
        let data = utils_1.Reflector.getFnMetadata(symbol, target.constructor, {});
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
        let data = utils_1.Reflector.getFnMetadata(symbol, target.constructor, {});
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