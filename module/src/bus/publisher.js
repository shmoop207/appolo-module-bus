"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
let Publisher = /** @class */ (() => {
    class Publisher {
        publish(type, data, expire) {
            return this.busProvider.publish(type, data, expire);
        }
        request(type, data, expire) {
            return this.busProvider.request(type, data, expire);
        }
    }
    tslib_1.__decorate([
        index_1.inject()
    ], Publisher.prototype, "busProvider", void 0);
    return Publisher;
})();
exports.Publisher = Publisher;
//# sourceMappingURL=publisher.js.map