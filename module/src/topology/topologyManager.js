"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopologyManager = void 0;
const tslib_1 = require("tslib");
const inject_1 = require("@appolo/inject");
const url = require("url");
const defaults_1 = require("../common/defaults");
const decorators_1 = require("../common/decorators");
const utils_1 = require("@appolo/utils");
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
            queues.unshift(utils_1.Strings.isString(this.moduleOptions.queue) ? { name: this.moduleOptions.queue } : this.moduleOptions.queue);
        }
        queues = queues.map(queue => Object.assign({}, defaults_1.QueueDefaults, queue, { name: this.appendEnv(queue.name) }));
        return queues;
    }
    _createRequestQueues() {
        let requestQueues = this.moduleOptions.requestQueues || [];
        if (this.moduleOptions.requestQueue) {
            requestQueues.unshift(utils_1.Strings.isString(this.moduleOptions.requestQueue) ? { name: this.moduleOptions.requestQueue } : this.moduleOptions.requestQueue);
        }
        requestQueues = requestQueues.map(queue => Object.assign({}, defaults_1.RequestQueueDefaults, queue, { name: this.appendEnv(queue.name) }));
        return requestQueues;
    }
    _createReplyQueue() {
        let replyQueue = null;
        if (this.moduleOptions.replyQueue) {
            replyQueue = utils_1.Strings.isString(this.moduleOptions.replyQueue) ? { name: this.moduleOptions.replyQueue } : this.moduleOptions.replyQueue;
            replyQueue = Object.assign({}, defaults_1.ReplyQueueDefaults, replyQueue, { name: this.appendEnv(replyQueue.name) });
        }
        return replyQueue;
    }
    _createExchanges() {
        let exchanges = this.moduleOptions.exchanges || [];
        if (this.moduleOptions.exchange) {
            exchanges.unshift(utils_1.Strings.isString(this.moduleOptions.exchange) ? { name: this.moduleOptions.exchange } : this.moduleOptions.exchange);
        }
        exchanges = exchanges.map(exchange => Object.assign({}, defaults_1.ExchangeDefaults, exchange, { name: this.appendEnv(exchange.name) }));
        return exchanges;
    }
    _createConnection() {
        let connection = this.moduleOptions.connection;
        if (utils_1.Strings.isString(this.moduleOptions.connection)) {
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
        handlers.forEach(handler => {
            bindings.push({
                exchange: handler.exchange,
                queue: handler.queue,
                keys: [handler.routingKey || handler.eventName]
            });
        });
        bindings = utils_1.Arrays.uniqBy(bindings, handler => handler.exchange + handler.queue + handler.keys.join());
        return bindings;
    }
    addMessageHandler(fn) {
        let metaData = utils_1.Reflector.getFnOwnMetadata(decorators_1.HandlerSymbol, fn), define = this.app.discovery.getClassDefinition(fn);
        return this.addHandler(fn, define, metaData, this.handlersManager, this.getDefaultQueueName());
    }
    addReplyMessageHandler(fn) {
        let metaData = utils_1.Reflector.getFnOwnMetadata(decorators_1.ReplySymbol, fn), define = this.app.discovery.getClassDefinition(fn);
        return this.addHandler(fn, define, metaData, this.repliesManager, this.getDefaultRequestQueueName());
    }
    _createHandlers(symbol, manager, defaultQueue) {
        let exported = this.app.tree.parent.discovery.findAllReflectData(symbol);
        exported.forEach((item) => this.addHandler(item.fn, item.define, item.metaData, manager, defaultQueue));
    }
    addHandler(fn, define, metaData, manager, defaultQueue) {
        let output = [];
        Object.keys(metaData || {}).forEach(key => {
            let handler = metaData[key];
            (handler.events || []).forEach(item => {
                let dto = this._addHandler(item.eventName, item.options, defaultQueue, manager, define, handler.propertyKey);
                output.push(dto);
            });
        });
        return output;
    }
    _addHandler(eventName, options, defaultQueue, manager, define, propertyKey) {
        options = options || {};
        if (typeof eventName == "function") {
            eventName = eventName(define.definition.injector ? define.definition.injector.get("app") : this.app);
        }
        let queue = this.appendEnv(options.queue) || defaultQueue, exchange = this.appendEnv(options.exchange) || this.getDefaultExchangeName(), routingKey = options.routingKey || eventName;
        if (!queue) {
            throw new Error(`no queue defined for ${eventName}`);
        }
        if (!exchange) {
            throw new Error(`no exchange defined for ${eventName}`);
        }
        options = Object.assign({}, options, { queue, exchange, routingKey });
        manager.register(eventName, options, define, propertyKey);
        return { eventName, options: options, define, propertyKey };
    }
};
tslib_1.__decorate([
    (0, inject_1.inject)()
], TopologyManager.prototype, "moduleOptions", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], TopologyManager.prototype, "env", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], TopologyManager.prototype, "app", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], TopologyManager.prototype, "handlersManager", void 0);
tslib_1.__decorate([
    (0, inject_1.inject)()
], TopologyManager.prototype, "repliesManager", void 0);
TopologyManager = tslib_1.__decorate([
    (0, inject_1.define)(),
    (0, inject_1.singleton)()
], TopologyManager);
exports.TopologyManager = TopologyManager;
//# sourceMappingURL=topologyManager.js.map