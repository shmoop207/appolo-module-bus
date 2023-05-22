"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const appolo_rabbit_1 = require("appolo-rabbit");
let Client = class Client {
    async get() {
        let config = this.topologyManager.buildTopology();
        let rabbit = await (0, appolo_rabbit_1.createRabbit)(config);
        this._bindEvents(rabbit);
        await rabbit.connect();
        return rabbit;
    }
    _bindEvents(rabbit) {
        rabbit.onUnhandled(function (message) {
            message.ack();
        });
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], Client.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Client.prototype, "env", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Client.prototype, "logger", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Client.prototype, "topologyManager", void 0);
Client = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)(),
    (0, inject_1.factory)()
], Client);
exports.Client = Client;
//# sourceMappingURL=client.js.map