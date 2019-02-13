"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const uuid = require("uuid");
const url = require("url");
let TopologyManager = class TopologyManager {
    get exchangeName() {
        return this.appendEnv(this.moduleOptions.exchangeName);
    }
    appendEnv(name) {
        return this.moduleOptions.appendEnv ? (`${name}-${this.envName}`) : name;
    }
    get envName() {
        return this.env.name || this.env.type || "production";
    }
    get queueName() {
        return this.appendEnv(this.moduleOptions.queueName);
    }
    get queueNameRequest() {
        return `${this.queueName}-request`;
    }
    get queueNameReply() {
        return `${this.queueName}-reply-${uuid.v4()}`;
    }
    buildTopology() {
        let amqp = url.parse(this.moduleOptions.connection);
        let messageHandlerKeys = [];
        let replyHandlerKeys = [];
        if (this.moduleOptions.listener) {
            messageHandlerKeys = this.handlersManager.keys;
            replyHandlerKeys = this.repliesManager.keys;
        }
        this.moduleOptions.queue.name = this.queueName;
        this.moduleOptions.requestQueue.name = this.queueNameRequest;
        this.moduleOptions.exchange.name = this.exchangeName;
        if (this.moduleOptions.replayQueue) {
            this.moduleOptions.replayQueue.name = this.queueNameReply;
        }
        let config = {
            connection: {
                user: amqp.auth.split(":")[0],
                pass: amqp.auth.split(":")[1],
                server: amqp.hostname,
                port: amqp.port || 5672,
                vhost: amqp.path.substr(1),
                replyQueue: this.moduleOptions.replayQueue
            },
            queues: [this.moduleOptions.queue, this.moduleOptions.requestQueue],
            exchanges: [this.moduleOptions.exchange],
            bindings: []
        };
        if (messageHandlerKeys.length) {
            config.bindings.push({
                exchange: this.exchangeName,
                target: this.queueName,
                keys: messageHandlerKeys
            });
        }
        if (replyHandlerKeys.length) {
            config.bindings.push({
                exchange: this.exchangeName,
                target: this.queueNameRequest,
                keys: replyHandlerKeys
            });
        }
        return config;
    }
};
tslib_1.__decorate([
    index_1.inject()
], TopologyManager.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    index_1.inject()
], TopologyManager.prototype, "env", void 0);
tslib_1.__decorate([
    index_1.inject()
], TopologyManager.prototype, "handlersManager", void 0);
tslib_1.__decorate([
    index_1.inject()
], TopologyManager.prototype, "repliesManager", void 0);
TopologyManager = tslib_1.__decorate([
    index_1.define(),
    index_1.singleton()
], TopologyManager);
exports.TopologyManager = TopologyManager;
//# sourceMappingURL=topologyManager.js.map