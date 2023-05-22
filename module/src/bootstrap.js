"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bootstrap = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const engine_1 = require("@appolo/engine");
let Bootstrap = class Bootstrap {
    async run() {
        if (this.moduleOptions.autoListen) {
            await this.busProvider.initialize();
        }
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], Bootstrap.prototype, "busProvider", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], Bootstrap.prototype, "moduleOptions", void 0);
Bootstrap = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)(),
    (0, engine_1.bootstrap)()
], Bootstrap);
exports.Bootstrap = Bootstrap;
//# sourceMappingURL=bootstrap.js.map