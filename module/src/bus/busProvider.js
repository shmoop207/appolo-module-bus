"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
const _ = require("lodash");
const uuid = require("uuid");
const url = require("url");
const requestError_1 = require("../common/requestError");
let BusProvider = class BusProvider {
    constructor() {
        this._inInitialized = false;
    }
    async initialize() {
        if (!this._inInitialized) {
            await this.messageManager.initialize();
            this._inInitialized = true;
        }
    }
    publish(type, data, expire) {
        let params = {
            messageId: uuid.v4(),
            type: type,
            body: data,
            routingKey: type,
            headers: {
                queue: this.topologyManager.queueName
            }
        };
        if (expire) {
            params.expiresAfter = expire;
        }
        return this.client.publish(this.topologyManager.exchangeName, params);
    }
    async request(type, data, expire) {
        expire = expire || this.moduleOptions.replyTimeout;
        let params = {
            messageId: uuid.v4(),
            type: type,
            body: data,
            routingKey: type,
            headers: {
                queue: this.topologyManager.queueName
            }
        };
        if (expire) {
            params.replyTimeout = expire;
            params.expiresAfter = expire;
        }
        let msg = await this.client.request(this.topologyManager.exchangeName, params);
        if (msg.body.success) {
            return msg.body.data;
        }
        else {
            let error = new requestError_1.RequestError(_.isObject(msg.body.message) ? JSON.stringify(msg.body.message) : msg.body.message);
            error.data = msg.body.data;
            throw error;
        }
    }
    replySuccess(msg, data) {
        msg.reply({
            success: true,
            data: data
        });
    }
    replyError(msg, e) {
        msg.reply({
            success: false,
            message: e.message,
            data: e.data
        });
    }
    async getQueueMessagesCount() {
        try {
            let amqp = url.parse(this.moduleOptions.connection);
            let params = {
                json: true,
                url: `https://${amqp.auth.split(":")[0]}:${amqp.auth.split(":")[1]}@${amqp.hostname}/api/queues/${amqp.path.substr(1)}/${this.topologyManager.queueName}`
            };
            let res = await RequestProvider.createRequest(params);
            return res.messages;
        }
        catch (e) {
            this.logger.error(`failed to get messages count from ${this.topologyManager.queueName}`);
            throw e;
        }
    }
};
tslib_1.__decorate([
    appolo_1.inject()
], BusProvider.prototype, "logger", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], BusProvider.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], BusProvider.prototype, "topologyManager", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], BusProvider.prototype, "client", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], BusProvider.prototype, "messageManager", void 0);
BusProvider = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], BusProvider);
exports.BusProvider = BusProvider;
//# sourceMappingURL=busProvider.js.map