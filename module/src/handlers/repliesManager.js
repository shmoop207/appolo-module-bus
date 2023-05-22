"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepliesManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const baseHandlersManager_1 = require("./baseHandlersManager");
let RepliesManager = class RepliesManager extends baseHandlersManager_1.BaseHandlersManager {
    constructor() {
        super(...arguments);
        this.Uniq = true;
    }
};
RepliesManager = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], RepliesManager);
exports.RepliesManager = RepliesManager;
//# sourceMappingURL=repliesManager.js.map