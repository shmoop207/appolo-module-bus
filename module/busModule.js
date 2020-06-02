"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusModule = void 0;
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const busProvider_1 = require("./src/bus/busProvider");
const defaults_1 = require("./src/common/defaults");
const decorators_1 = require("./src/common/decorators");
const _ = require("lodash");
let BusModule = /** @class */ (() => {
    var BusModule_1;
    let BusModule = BusModule_1 = class BusModule extends appolo_1.Module {
        constructor(options) {
            super(options);
        }
        static for(options) {
            return new BusModule_1(options);
        }
        get defaults() {
            return defaults_1.Defaults;
        }
        get exports() {
            return [{ id: this.moduleOptions.id, type: busProvider_1.BusProvider }];
        }
        beforeInitialize() {
            let publisherMeta = appolo_1.Util.findAllReflectData(decorators_1.PublisherSymbol, this.app.parent.exported);
            let requestMeta = appolo_1.Util.findAllReflectData(decorators_1.RequestSymbol, this.app.parent.exported);
            _.forEach(publisherMeta, (item => this._createPublishers(item)));
            _.forEach(requestMeta, (item => this._createRequests(item)));
        }
        _createPublishers(item) {
            _.forEach(item.metaData, publisher => this._createPublisher(item.fn, publisher));
        }
        _createRequests(item) {
            _.forEach(item.metaData, publisher => this._createRequest(item.fn, publisher));
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
        appolo_1.module()
    ], BusModule);
    return BusModule;
})();
exports.BusModule = BusModule;
//# sourceMappingURL=busModule.js.map