"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHandlersManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
let BaseHandlersManager = class BaseHandlersManager {
    constructor() {
        this._handlers = new Map();
        this.Uniq = false;
    }
    register(eventName, options, define, propertyKey) {
        let key = this._getKey(eventName, options.queue, options.exchange, options.routingKey);
        if (this.Uniq && this._handlers.has(key)) {
            throw new Error(`replay event handler must be uniq for ${eventName}`);
        }
        if (!this._handlers.has(key)) {
            this._handlers.set(key, {
                handlers: [],
                eventName,
                exchange: options.exchange,
                queue: options.queue,
                routingKey: options.routingKey,
            });
        }
        this._handlers.get(key).handlers.push({
            define,
            propertyKey: propertyKey,
            retry: options.retry
        });
    }
    _getKey(eventName, queue, exchange, routingKey) {
        return `${eventName}##${queue}##${exchange}##${routingKey}`;
    }
    getHandlersProperties() {
        return Array.from(this._handlers.values());
    }
    getHandlers(eventName, queue, exchange, routingKey) {
        let key = this._getKey(eventName, queue, exchange, routingKey);
        let handlers = this._handlers.get(key);
        return handlers ? handlers.handlers : [];
    }
    clean() {
        this._handlers.clear();
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], BaseHandlersManager.prototype, "app", void 0);
BaseHandlersManager = tslib_1.__decorate([
    (0, inject_1.singleton)()
], BaseHandlersManager);
exports.BaseHandlersManager = BaseHandlersManager;
//# sourceMappingURL=baseHandlersManager.js.map