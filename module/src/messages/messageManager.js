"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const _ = require("lodash");
let MessageManager = class MessageManager {
    async initialize() {
        this.client.handle("#", msg => this._handleMessage(msg));
        if (this.handlersManager.keys.length) {
            this.client.startSubscription(this.topologyManager.queueName);
            this.logger.info(`bus handler subscription ${this.handlersManager.keys.join(",")}`);
        }
        if (this.repliesManager.keys.length) {
            this.client.startSubscription(this.topologyManager.queueNameRequest);
            this.logger.info(`bus reply subscription ${this.repliesManager.keys.join(",")}`);
        }
    }
    async _handleMessage(msg) {
        let handlers = this.handlersManager.getHandlers(msg.type);
        //we have handler
        if (handlers.length) {
            await Promise.all(_.map(handlers, handler => this._callHandler(msg, handler)));
            return;
        }
        let replies = this.repliesManager.getHandlers(msg.type);
        //we have replies
        if (replies.length) {
            await this._callReply(msg, replies[0]);
            return;
        }
        //ack the message if do not have  a handler
        msg.ack();
    }
    async _callHandler(msg, handler) {
        try {
            let instance = this.injector.parent.get(handler.define.definition.id);
            await instance[handler.propertyKey](msg);
            msg.ack();
        }
        catch (e) {
            this.logger.error(`failed to handle message ${msg.type}`, { err: e, msg: msg });
            msg.nack();
        }
    }
    async _callReply(msg, handler) {
        try {
            let instance = this.injector.parent.get(handler.define.definition.id);
            let data = await instance[handler.propertyKey](msg);
            this.busProvider.replySuccess(msg, data);
        }
        catch (e) {
            this.busProvider.replyError(msg, e);
        }
    }
};
tslib_1.__decorate([
    index_1.inject()
], MessageManager.prototype, "client", void 0);
tslib_1.__decorate([
    index_1.inject()
], MessageManager.prototype, "injector", void 0);
tslib_1.__decorate([
    index_1.inject()
], MessageManager.prototype, "handlersManager", void 0);
tslib_1.__decorate([
    index_1.inject()
], MessageManager.prototype, "repliesManager", void 0);
tslib_1.__decorate([
    index_1.inject()
], MessageManager.prototype, "topologyManager", void 0);
tslib_1.__decorate([
    index_1.inject()
], MessageManager.prototype, "logger", void 0);
tslib_1.__decorate([
    index_1.inject()
], MessageManager.prototype, "busProvider", void 0);
MessageManager = tslib_1.__decorate([
    index_1.define(),
    index_1.singleton()
], MessageManager);
exports.MessageManager = MessageManager;
//# sourceMappingURL=messageManager.js.map