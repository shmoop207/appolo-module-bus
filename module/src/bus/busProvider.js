"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusProvider = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const utils_1 = require("@appolo/utils");
let BusProvider = class BusProvider {
    constructor() {
        this._inInitialized = false;
        this._isClosed = false;
        this._connectionRetries = 0;
    }
    async initialize() {
        if (this._inInitialized) {
            return;
        }
        await this.messageManager.initialize();
        this._inInitialized = true;
        this.app.event.beforeReset.once(() => this.close());
        process.on('exit', () => this.close());
        this.client.on('closed', this._onRabbitClosed, this);
        this.client.on('failed', this._onRabbitFailed, this);
        this.client.on('connected', this._onRabbitConnected, this);
    }
    _onRabbitConnected() {
        this._connectionRetries = 0;
        this._isClosed = false;
    }
    _onRabbitClosed(err) {
        if (this._isClosed) {
            return;
        }
        this.logger.error("connection to rabbit unreachable", { err: err });
        (this.topologyManager.envName != "testing") && process.exit(1);
    }
    async _onRabbitFailed(err) {
        this.logger.error("connection to rabbit failed", { err: err });
        if (this._connectionRetries < this.moduleOptions.connectionRetries) {
            this.logger.error(`connection to rabbit failed reconnecting attempt: ${this._connectionRetries}`, { err: err });
            this._connectionRetries++;
            let [e] = await utils_1.Promises.to(this.client.reconnect());
            if (e) {
                this._onRabbitFailed(e);
            }
        }
        else {
            (this.topologyManager.envName != "testing") && process.exit(1);
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
        if (this._isClosed) {
            return;
        }
        this._isClosed = true;
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
    inject_1.inject()
], BusProvider.prototype, "logger", void 0);
tslib_1.__decorate([
    inject_1.inject()
], BusProvider.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    inject_1.inject()
], BusProvider.prototype, "topologyManager", void 0);
tslib_1.__decorate([
    inject_1.inject()
], BusProvider.prototype, "client", void 0);
tslib_1.__decorate([
    inject_1.inject()
], BusProvider.prototype, "messageManager", void 0);
tslib_1.__decorate([
    inject_1.inject()
], BusProvider.prototype, "httpService", void 0);
tslib_1.__decorate([
    inject_1.inject()
], BusProvider.prototype, "app", void 0);
BusProvider = tslib_1.__decorate([
    inject_1.define(),
    inject_1.singleton()
], BusProvider);
exports.BusProvider = BusProvider;
//# sourceMappingURL=busProvider.js.map