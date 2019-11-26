"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const _ = require("lodash");
let MessageManager = class MessageManager {
    async initialize() {
        this._handler = this.client.handle({
            type: "#",
            handler: msg => this._handleMessage(msg),
            queue: this.topologyManager.getDefaultQueueName()
        });
        await this.client.subscribe();
        this.logger.info(`bus handlers subscription ${this.handlersManager.getHandlersProperties().map((item) => item.eventName).join(",")}`);
        this.logger.info(`bus reply subscription ${this.repliesManager.getHandlersProperties().map((item) => item.eventName).join(",")}`);
    }
    async _handleMessage(msg) {
        let handlers = this.handlersManager.getHandlers(msg.type, msg.queue, msg.fields.exchange, msg.fields.routingKey);
        //we have handler
        if (handlers.length) {
            await Promise.all(_.map(handlers, handler => this._callHandler(msg, handler)));
            return;
        }
        let replies = this.repliesManager.getHandlers(msg.type, msg.queue, msg.fields.exchange, msg.fields.routingKey);
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
            if (!msg.isAcked) {
                msg.ack();
            }
        }
        catch (e) {
            this.logger.error(`failed to handle message ${msg.type}`, { err: e, msg: msg });
            if (!msg.isAcked) {
                msg.nack();
            }
        }
    }
    async _callReply(msg, handler) {
        try {
            let instance = this.injector.parent.get(handler.define.definition.id);
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
        await this.client.unSubscribe();
        this._handler.remove();
        this.repliesManager.clean();
        this.handlersManager.clean();
        this._handler = null;
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