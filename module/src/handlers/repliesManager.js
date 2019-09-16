"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const baseHandlersManager_1 = require("./baseHandlersManager");
let RepliesManager = class RepliesManager extends baseHandlersManager_1.BaseHandlersManager {
    constructor() {
        super(...arguments);
        this.Uniq = true;
    }
};
RepliesManager = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], RepliesManager);
exports.RepliesManager = RepliesManager;
//# sourceMappingURL=repliesManager.js.map