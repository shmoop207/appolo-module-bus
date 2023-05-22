"use strict";
var BusModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusModule = void 0;
const tslib_1 = require("tslib");
const engine_1 = require("@appolo/engine");
const busProvider_1 = require("./src/bus/busProvider");
const defaults_1 = require("./src/common/defaults");
const decorators_1 = require("./src/common/decorators");
let BusModule = BusModule_1 = class BusModule extends engine_1.Module {
    static for(options) {
        return { type: BusModule_1, options };
    }
    get defaults() {
        return defaults_1.Defaults;
    }
    get exports() {
        return [{ id: this.moduleOptions.id, type: busProvider_1.BusProvider }];
    }
    beforeModuleInitialize() {
        let publisherMeta = this.app.tree.parent.discovery.findAllReflectData(decorators_1.PublisherSymbol);
        let requestMeta = this.app.tree.parent.discovery.findAllReflectData(decorators_1.RequestSymbol);
        (publisherMeta || []).forEach(item => this._createPublishers(item));
        (requestMeta || []).forEach(item => this._createRequests(item));
    }
    _createPublishers(item) {
        Object.keys(item.metaData || {}).forEach(key => this._createPublisher(item.fn, item.metaData[key]));
    }
    _createRequests(item) {
        Object.keys(item.metaData || {}).forEach(key => this._createRequest(item.fn, item.metaData[key]));
    }
    async _createPublisher(fn, item) {
        let old = fn.prototype[item.propertyKey];
        let $self = this;
        fn.prototype[item.propertyKey] = async function () {
            try {
                let result = await old.apply(this, arguments);
                let provider = $self.app.injector.get(busProvider_1.BusProvider);
                await provider.publish(Object.assign({ type: item.eventName, data: result }, item.options));
                return result;
            }
            catch (e) {
                let logger = $self.app.injector.get("logger");
                logger.error(`failed to publish ${item.eventName}`, { e });
                throw e;
            }
        };
    }
    async _createRequest(fn, item) {
        let old = fn.prototype[item.propertyKey];
        let $self = this;
        fn.prototype[item.propertyKey] = async function () {
            try {
                let data = await old.apply(this, arguments);
                let provider = $self.app.injector.get(busProvider_1.BusProvider);
                let result = await provider.request(Object.assign({ type: item.eventName, data }, item.options));
                return result;
            }
            catch (e) {
                let logger = $self.app.injector.get("logger");
                logger.error(`failed to request ${item.eventName}`, { e });
                throw e;
            }
        };
    }
};
BusModule = BusModule_1 = tslib_1.__decorate([
    (0, engine_1.module)()
], BusModule);
exports.BusModule = BusModule;
//# sourceMappingURL=busModule.js.map