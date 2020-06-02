"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopologyManager = void 0;
const tslib_1 = require("tslib");
const index_1 = require("appolo/index");
const _ = require("lodash");
const url = require("url");
const defaults_1 = require("../common/defaults");
const decorators_1 = require("../common/decorators");
let TopologyManager = /** @class */ (() => {
    let TopologyManager = class TopologyManager {
        appendEnv(name) {
            return name ? (this.moduleOptions.addEnvToNames ? (`${name}-${this.envName}`) : name) : "";
        }
        get envName() {
            return this.env.name || this.env.type || "production";
        }
        get connection() {
            return this._connection;
        }
        getDefaultQueueName() {
            return this._queues.length ? this._queues[0].name : "";
        }
        getDefaultRequestQueueName() {
            return this._requests.length ? this._requests[0].name : "";
        }
        getDefaultExchangeName() {
            return this._exchanges[0].name;
        }
        buildTopology() {
            this._connection = this._createConnection();
            this._exchanges = this._createExchanges();
            this._replyQueue = this._createReplyQueue();
            this._queues = this._createQueues();
            this._requests = this._createRequestQueues();
            this._createHandlers(decorators_1.HandlerSymbol, this.handlersManager, this.getDefaultQueueName());
            this._createHandlers(decorators_1.ReplySymbol, this.repliesManager, this.getDefaultRequestQueueName());
            let config = {
                connection: this._connection,
                queues: this._queues,
                requestQueues: this._requests,
                replyQueue: this._replyQueue,
                exchanges: this._exchanges,
                bindings: this._createBindings()
            };
            return config;
        }
        _createQueues() {
            let queues = this.moduleOptions.queues || [];
            if (this.moduleOptions.queue) {
                queues.unshift(_.isString(this.moduleOptions.queue) ? { name: this.moduleOptions.queue } : this.moduleOptions.queue);
            }
            queues = _.map(queues, queue => Object.assign({}, defaults_1.QueueDefaults, queue, { name: this.appendEnv(queue.name) }));
            return queues;
        }
        _createRequestQueues() {
            let requestQueues = this.moduleOptions.requestQueues || [];
            if (this.moduleOptions.requestQueue) {
                requestQueues.unshift(_.isString(this.moduleOptions.requestQueue) ? { name: this.moduleOptions.requestQueue } : this.moduleOptions.requestQueue);
            }
            requestQueues = _.map(requestQueues, queue => Object.assign({}, defaults_1.RequestQueueDefaults, queue, { name: this.appendEnv(queue.name) }));
            return requestQueues;
        }
        _createReplyQueue() {
            let replyQueue = null;
            if (this.moduleOptions.replyQueue) {
                replyQueue = _.isString(this.moduleOptions.replyQueue) ? { name: this.moduleOptions.replyQueue } : this.moduleOptions.replyQueue;
                replyQueue = Object.assign({}, defaults_1.ReplyQueueDefaults, replyQueue, { name: this.appendEnv(replyQueue.name) });
            }
            return replyQueue;
        }
        _createExchanges() {
            let exchanges = this.moduleOptions.exchanges || [];
            if (this.moduleOptions.exchange) {
                exchanges.unshift(_.isString(this.moduleOptions.exchange) ? { name: this.moduleOptions.exchange } : this.moduleOptions.exchange);
            }
            exchanges = _.map(exchanges, exchange => Object.assign({}, defaults_1.ExchangeDefaults, exchange, { name: this.appendEnv(exchange.name) }));
            return exchanges;
        }
        _createConnection() {
            let connection = this.moduleOptions.connection;
            if (_.isString(this.moduleOptions.connection)) {
                connection = { uri: this.moduleOptions.connection };
            }
            if (connection.uri) {
                connection = Object.assign({}, connection, this._parseUri(connection.uri));
            }
            return connection;
        }
        _parseUri(uri) {
            let amqp = url.parse(uri);
            return {
                username: amqp.auth.split(":")[0],
                password: amqp.auth.split(":")[1],
                hostname: amqp.hostname,
                port: parseInt(amqp.port) || 5672,
                vhost: amqp.path.substr(1),
            };
        }
        _createBindings() {
            let messageHandlers = [], replyHandlers = [], bindings = [];
            if (this.moduleOptions.handleEvents) {
                messageHandlers = this.handlersManager.getHandlersProperties();
                replyHandlers = this.repliesManager.getHandlersProperties();
            }
            let handlers = messageHandlers.concat(replyHandlers);
            _.forEach(handlers, handler => {
                bindings.push({
                    exchange: handler.exchange,
                    queue: handler.queue,
                    keys: [handler.eventName]
                });
            });
            return bindings;
        }
        _createHandlers(symbol, manager, defaultQueue) {
            let exported = index_1.Util.findAllReflectData(symbol, this.app.parent.exported);
            _.forEach(exported, (item) => this._createHandler(item.fn, item.define, item.metaData, manager, defaultQueue));
        }
        _createHandler(fn, define, metaData, manager, defaultQueue) {
            _.forEach(metaData, handler => {
                _.forEach(handler.events, item => {
                    let options = item.options || {};
                    let queue = this.appendEnv(options.queue) || defaultQueue, exchange = this.appendEnv(options.exchange) || this.getDefaultExchangeName(), routingKey = options.routingKey || item.eventName;
                    if (!queue) {
                        throw new Error(`no queue defined for ${item.eventName}`);
                    }
                    if (!exchange) {
                        throw new Error(`no exchange defined for ${item.eventName}`);
                    }
                    options = Object.assign({}, item.options, { queue, exchange, routingKey });
                    manager.register(item.eventName, options, define, handler.propertyKey);
                });
            });
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
    ], TopologyManager.prototype, "app", void 0);
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
    return TopologyManager;
})();
exports.TopologyManager = TopologyManager;
//# sourceMappingURL=topologyManager.js.map