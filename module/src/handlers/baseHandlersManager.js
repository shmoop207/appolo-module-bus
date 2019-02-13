"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const _ = require("lodash");
let BaseHandlersManager = class BaseHandlersManager {
    constructor() {
        this._handlers = new Map();
        this.Uniq = false;
    }
    initialize() {
        let exported = appolo_1.Util.findAllReflectData(this.Symbol, this.app.parent.exported);
        _.forEach(exported, (item) => this._createHandler(item.fn, item.define, item.metaData));
    }
    _createHandler(fn, define, metaData) {
        _.forEach(metaData, handler => {
            _.forEach(handler.eventNames, eventName => {
                if (this.Uniq && this._handlers.has(eventName)) {
                    throw new Error(`replay event handler must be uniq for ${eventName}`);
                }
                if (!this._handlers.has(eventName)) {
                    this._handlers.set(eventName, []);
                }
                this._handlers.get(eventName).push({ define, propertyKey: handler.propertyKey });
            });
        });
    }
    get keys() {
        return Array.from(this._handlers.keys());
    }
    getHandlers(key) {
        return this._handlers.get(key) || [];
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], BaseHandlersManager.prototype, "app", void 0);
tslib_1.__decorate([
    appolo_1.initMethod()
], BaseHandlersManager.prototype, "initialize", null);
BaseHandlersManager = tslib_1.__decorate([
    appolo_1.singleton()
], BaseHandlersManager);
exports.BaseHandlersManager = BaseHandlersManager;
//# sourceMappingURL=baseHandlersManager.js.map