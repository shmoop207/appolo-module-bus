"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const utils_1 = require("@appolo/utils");
let MessageManager = class MessageManager {
    constructor() {
        this._initialized = false;
    }
    async initialize() {
        this._handler = this.client.handle({
            type: "#",
            handler: msg => this._handleMessage(msg),
            queue: this.topologyManager.getDefaultQueueName()
        });
        this._handlerRequest = this.client.handle({
            type: "#",
            handler: msg => this._handleRequestMessage(msg),
            queue: this.topologyManager.getDefaultRequestQueueName()
        });
        await this.client.subscribe();
        let handlers = this.handlersManager.getHandlersProperties();
        if (handlers.length) {
            this.logger.info(`bus handlers subscription ${handlers.map((item) => item.eventName).join(",")}`);
        }
        let replyHandlers = this.repliesManager.getHandlersProperties();
        if (replyHandlers.length) {
            this.logger.info(`bus reply subscription ${replyHandlers.map((item) => item.eventName).join(",")}`);
        }
        this._initialized = true;
    }
    async _handleRequestMessage(msg) {
        let replies = this.repliesManager.getHandlers(msg.type, msg.queue, msg.fields.exchange, msg.fields.routingKey);
        if (replies.length) {
            await this._callReply(msg, replies[0]);
        }
        msg.ack();
    }
    async _handleMessage(msg) {
        let handlers = this.handlersManager.getHandlers(msg.type, msg.queue, msg.fields.exchange, msg.fields.routingKey);
        if (handlers.length) {
            await utils_1.Promises.map(handlers || [], handler => this._callHandler(msg, handler));
        }
        msg.ack();
    }
    async _callHandler(msg, handler) {
        try {
            let instance = this._getHandlerInjector(handler).get(handler.define.definition.id);
            if (handler.retry) {
                msg.retry = handler.retry;
            }
            await instance[handler.propertyKey](msg);
            if (!msg.isAcked) {
                msg.ack();
            }
        }
        catch (e) {
            this.logger.error(`failed to handle message ${msg.type}`, { err: e, msg: msg.body });
            if (!msg.isAcked) {
                msg.nack();
            }
        }
    }
    _getHandlerInjector(handler) {
        let def = handler.define.definition, injector = def.injector && def.injector.hasDefinition(def.id)
            ? def.injector
            : this.injector.parent;
        return injector;
    }
    async _callReply(msg, handler) {
        try {
            let instance = this._getHandlerInjector(handler).get(handler.define.definition.id);
            let data = await instance[handler.propertyKey](msg);
            if (!msg.isAcked) {
                msg.replyResolve(data);
            }
        }
        catch (e) {
            if (!msg.isAcked) {
                msg.replyReject(e);
            }
        }
    }
    async clean() {
        if (this._initialized) {
            await this.client.unSubscribe();
            this._handler.remove();
            this._handlerRequest.remove();
        }
        this.repliesManager.clean();
        this.handlersManager.clean();
        this._handler = null;
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], MessageManager.prototype, "client", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], MessageManager.prototype, "injector", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], MessageManager.prototype, "handlersManager", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], MessageManager.prototype, "repliesManager", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], MessageManager.prototype, "topologyManager", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], MessageManager.prototype, "logger", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], MessageManager.prototype, "busProvider", void 0);
MessageManager = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], MessageManager);
exports.MessageManager = MessageManager;
//# sourceMappingURL=messageManager.js.map