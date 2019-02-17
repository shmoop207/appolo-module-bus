"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const _ = require("lodash");
let MessageManager = class MessageManager {
    async initialize() {
        this._handler = this.client.handle("#", msg => this._handleMessage(msg));
        if (this.handlersManager.keys.length) {
            this.client.startSubscription(this.topologyManager.queueName, false, this.topologyManager.connectionName);
            this.logger.info(`bus handler subscription ${this.handlersManager.keys.join(",")}`);
        }
        if (this.repliesManager.keys.length) {
            this.client.startSubscription(this.topologyManager.queueNameRequest, false, this.topologyManager.connectionName);
            this.logger.info(`bus reply subscription ${this.repliesManager.keys.join(",")}`);
        }
    }
    async _handleMessage(msg) {
        this._extendMessage(msg);
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
            if (!msg.sent) {
                msg.ack();
            }
        }
        catch (e) {
            this.logger.error(`failed to handle message ${msg.type}`, { err: e, msg: msg });
            if (!msg.sent) {
                msg.nack();
            }
        }
    }
    async _callReply(msg, handler) {
        try {
            let instance = this.injector.parent.get(handler.define.definition.id);
            let data = await instance[handler.propertyKey](msg);
            if (!msg.sent) {
                msg.replySuccess(data);
            }
        }
        catch (e) {
            if (!msg.sent) {
                msg.replyError(e);
            }
        }
    }
    _extendMessage(msg) {
        let oldAck = msg.ack;
        let oldReject = msg.reject;
        let oldNack = msg.nack;
        let oldReply = msg.reply;
        msg.ack = function () {
            this.sent = true;
            return oldAck.apply(this, arguments);
        };
        msg.reject = function () {
            this.sent = true;
            return oldReject.apply(this, arguments);
        };
        msg.nack = function () {
            this.sent = true;
            return oldNack.apply(this, arguments);
        };
        msg.reply = function () {
            this.sent = true;
            return oldReply.apply(this, arguments);
        };
        msg.replySuccess = function (data) {
            return this.reply({
                success: true,
                data: data
            });
        };
        msg.replyError = function (e) {
            return this.reply({
                success: false,
                message: e && e.message,
                data: e && e.data
            });
        };
    }
    clean() {
        if (this.handlersManager.keys.length) {
            this.client.stopSubscription(this.topologyManager.queueName, this.topologyManager.connectionName);
        }
        if (this.repliesManager.keys.length) {
            this.client.stopSubscription(this.topologyManager.queueNameRequest, this.topologyManager.connectionName);
        }
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