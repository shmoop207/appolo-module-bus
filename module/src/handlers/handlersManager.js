"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlersManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const baseHandlersManager_1 = require("./baseHandlersManager");
let HandlersManager = class HandlersManager extends baseHandlersManager_1.BaseHandlersManager {
};
HandlersManager = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], HandlersManager);
exports.HandlersManager = HandlersManager;
//# sourceMappingURL=handlersManager.js.map