"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const appolo_1 = require("appolo");
let BusProvider = class BusProvider {
    constructor() {
        this._inInitialized = false;
    }
    async initialize() {
        if (!this._inInitialized) {
            await this.messageManager.initialize();
            this._inInitialized = true;
            this.app.once(appolo_1.Events.BeforeReset, () => this.close());
        }
    }
    publish(opts) {
        if (arguments.length > 1) {
            opts = {
                routingKey: arguments[0],
                type: arguments[1],
                data: arguments[2],
                expire: arguments[3]
            };
        }
        let { params, exchange } = this._createPublishParams(opts);
        return this.client.publish(exchange, params);
    }
    async request(opts) {
        if (arguments.length > 1) {
            opts = {
                routingKey: arguments[0],
                type: arguments[1],
                data: arguments[2],
                expire: arguments[3]
            };
        }
        let { params, exchange } = this._createPublishParams(opts);
        if (params.expiration) {
            params.replyTimeout = params.expiration || this.moduleOptions.replyTimeout;
        }
        let result = await this.client.request(exchange, params);
        return result;
    }
    async requestStream(opts) {
        let { params, exchange } = this._createPublishParams(opts);
        if (params.expiration) {
            params.replyTimeout = params.expiration || this.moduleOptions.replyTimeout;
        }
        let stream = await this.client.requestStream(exchange, params);
        return stream;
    }
    _createPublishParams(opts) {
        let queue = this.topologyManager.appendEnv(opts.queue) || this.topologyManager.getDefaultRequestQueueName(), exchange = this.topologyManager.appendEnv(opts.exchange) || this.topologyManager.getDefaultExchangeName();
        let params = {
            type: opts.type,
            body: opts.data,
            routingKey: opts.routingKey || opts.type,
            headers: {
                queue: queue
            }
        };
        if (opts.expire) {
            params.expiration = opts.expire;
        }
        return { exchange, params };
    }
    async close() {
        await this.messageManager.clean();
        await this.client.close();
    }
    async getQueueMessagesCount(queue) {
        queue = this.topologyManager.appendEnv(queue) || this.topologyManager.getDefaultQueueName();
        try {
            let connection = this.topologyManager.connection;
            let params = {
                json: true,
                url: `https://${connection.username}:${connection.password}@${connection.hostname}/api/queues/${connection.vhost}/${queue}`
            };
            let res = await this.httpService.request(params);
            return res.data.messages;
        }
        catch (e) {
            this.logger.error(`failed to get messages count from ${queue}`);
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
tslib_1.__decorate([
    appolo_1.inject()
], BusProvider.prototype, "httpService", void 0);
tslib_1.__decorate([
    appolo_1.inject()
], BusProvider.prototype, "app", void 0);
BusProvider = tslib_1.__decorate([
    appolo_1.define(),
    appolo_1.singleton()
], BusProvider);
exports.BusProvider = BusProvider;
//# sourceMappingURL=busProvider.js.map