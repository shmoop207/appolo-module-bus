"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
class Publisher {
    publish(type, data, expire) {
        return this.busProvider.publish(type, data, expire);
    }
    request(type, data, expire) {
        return this.busProvider.request(type, data, expire);
    }
}
tslib_1.__decorate([
    inject_1.inject()
], Publisher.prototype, "busProvider", void 0);
exports.Publisher = Publisher;
//# sourceMappingURL=publisher.js.map