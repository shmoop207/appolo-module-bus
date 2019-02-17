"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const rabbit = require("rabbot");
let Client = class Client {
    async get() {
        let config = this.topologyManager.buildTopology();
        this._bindEvents();
        await rabbit.configure(config);
        return rabbit;
    }
    _bindEvents() {
        process.on('exit', function (err) {
            rabbit.close();
        });
        rabbit.on('unreachable', (err) => {
            this.logger.error("connection to rabbit unreachable", { err: err });
            (this.topologyManager.envName != "testing") && process.exit(1);
        });
        rabbit.on('failed', (err) => {
            this.logger.error("connection to rabbit failed", { err: err });
            (this.topologyManager.envName != "testing") && process.exit(1);
        });
        // rabbit.on('closed', () => {
        //     this.logger.error("connection to rabbit closed");
        // });
        rabbit.onUnhandled(function (message) {
            message.ack();
        });
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], Client.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Client.prototype, "env", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Client.prototype, "logger", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Client.prototype, "topologyManager", void 0);
Client = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton(),
    appolo_1.factory()
], Client);
exports.Client = Client;
//# sourceMappingURL=client.js.map