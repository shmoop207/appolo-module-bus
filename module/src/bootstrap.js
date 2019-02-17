"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
let Bootstrap = class Bootstrap {
    async run() {
        if (this.moduleOptions.auto) {
            await this.busProvider.initialize();
        }
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], Bootstrap.prototype, "busProvider", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], Bootstrap.prototype, "moduleOptions", void 0);
Bootstrap = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton(),
    appolo_1.bootstrap()
], Bootstrap);
exports.Bootstrap = Bootstrap;
//# sourceMappingURL=bootstrap.js.map