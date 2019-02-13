"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const decorators_1 = require("../common/decorators");
const baseHandlersManager_1 = require("./baseHandlersManager");
let HandlersManager = class HandlersManager extends baseHandlersManager_1.BaseHandlersManager {
    constructor() {
        super(...arguments);
        this.Symbol = decorators_1.HandlerSymbol;
    }
};
HandlersManager = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], HandlersManager);
exports.HandlersManager = HandlersManager;
//# sourceMappingURL=handlersManager.js.map