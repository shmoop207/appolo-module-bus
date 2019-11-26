import {define, IEnv, inject, singleton, Util, Define, App} from "appolo/index";
import {IOptions} from "../common/IOptions";
import * as _ from "lodash";
import {HandlersManager} from "../handlers/handlersManager";
import {RepliesManager} from "../handlers/repliesManager";
import url = require("url");
import {
    createRabbit,
    IConnectionOptions,
    IExchangeOptions,
    IOptions as RabbitOptions,
    IQueueOptions, IBindingOptions
} from "appolo-rabbit";
import {ExchangeDefaults, QueueDefaults, ReplyQueueDefaults, RequestQueueDefaults} from "../common/defaults";
import {IHandlerMetadata, IHandlerProperties} from "../common/interfaces";
import {BaseHandlersManager} from "../handlers/baseHandlersManager";
import {HandlerSymbol, ReplySymbol, RequestSymbol} from "../common/decorators";

@define()
@singleton()
export class TopologyManager {
    @inject() private moduleOptions: IOptions;
    @inject() private env: IEnv;
    @inject() private app: App;
    @inject() private handlersManager: HandlersManager;
    @inject() private repliesManager: RepliesManager;

    private _queues: IQueueOptions[];
    private _requests: IQueueOptions[];
    private _exchanges: IQueueOptions[];
    private _connection: IConnectionOptions;
    private _replyQueue: IQueueOptions;


    public appendEnv(name: string): string {
        return name ? (this.moduleOptions.addEnvToNames ? (`${name}-${this.envName}`) : name) : "";
    }

    public get envName(): string {
        return this.env.name || this.env.type || "production";
    }

    public get connection(): IConnectionOptions {
        return this._connection
    }

    public getDefaultQueueName(): string {
        return this._queues.length ? this._queues[0].name : "";
    }

    public getDefaultRequestQueueName(): string {
        return this._requests.length ? this._requests[0].name : ""
    }

    public getDefaultExchangeName(): string {
        return this._exchanges[0].name
    }

    public buildTopology(): RabbitOptions {

        this._connection = this._createConnection();

        this._exchanges = this._createExchanges();

        this._replyQueue = this._createReplyQueue();

        this._queues = this._createQueues();

        this._requests = this._createRequestQueues();

        this._createHandlers(HandlerSymbol, this.handlersManager, this.getDefaultQueueName());
        this._createHandlers(ReplySymbol, this.repliesManager, this.getDefaultRequestQueueName());

        let config = <RabbitOptions>{
            connection: this._connection,
            queues: this._queues,
            requestQueues: this._requests,
            replyQueue: this._replyQueue,
            exchanges: this._exchanges,
            bindings: this._createBindings()
        };

        return config;
    }

    private _createQueues(): IQueueOptions[] {
        let queues = this.moduleOptions.queues || [];

        if (this.moduleOptions.queue) {
            queues.unshift(_.isString(this.moduleOptions.queue) ? {name: this.moduleOptions.queue} : this.moduleOptions.queue);
        }

        queues = _.map(queues, queue => Object.assign({}, QueueDefaults, queue, {name: this.appendEnv(queue.name)}));

        return queues;

    }

    private _createRequestQueues(): IQueueOptions[] {
        let requestQueues = this.moduleOptions.requestQueues || [];

        if (this.moduleOptions.requestQueue) {
            requestQueues.unshift(_.isString(this.moduleOptions.requestQueue) ? {name: this.moduleOptions.requestQueue} : this.moduleOptions.requestQueue);
        }

        requestQueues = _.map(requestQueues, queue => Object.assign({}, RequestQueueDefaults, queue, {name: this.appendEnv(queue.name)}));

        return requestQueues;
    }


    private _createReplyQueue(): IQueueOptions {
        let replyQueue = null;

        if (this.moduleOptions.replyQueue) {
            replyQueue = _.isString(this.moduleOptions.replyQueue) ? {name: this.moduleOptions.replyQueue} : this.moduleOptions.replyQueue;

            replyQueue = Object.assign({}, ReplyQueueDefaults, replyQueue, {name: this.appendEnv(replyQueue.name)})
        }

        return replyQueue;
    }

    private _createExchanges(): IExchangeOptions[] {

        let exchanges = this.moduleOptions.exchanges || [];

        if (this.moduleOptions.exchange) {
            exchanges.unshift(_.isString(this.moduleOptions.exchange) ? {name: this.moduleOptions.exchange} : this.moduleOptions.exchange);

        }

        exchanges = _.map(exchanges, exchange => Object.assign({}, ExchangeDefaults, exchange, {name: this.appendEnv(exchange.name)}));

        return exchanges;
    }

    private _createConnection(): IConnectionOptions {
        let connection: IConnectionOptions = this.moduleOptions.connection as IConnectionOptions;

        if (_.isString(this.moduleOptions.connection)) {
            connection = {uri: this.moduleOptions.connection}
        }

        if (connection.uri) {
            connection = Object.assign({}, connection, this._parseUri(connection.uri))
        }

        return connection;
    }

    private _parseUri(uri: string) {
        let amqp = url.parse(uri);
        return {
            username: amqp.auth.split(":")[0],
            password: amqp.auth.split(":")[1],
            hostname: amqp.hostname,
            port: parseInt(amqp.port) || 5672,
            vhost: amqp.path.substr(1),
        }
    }

    private _createBindings(): IBindingOptions[] {
        let messageHandlers = [], replyHandlers = [], bindings: IBindingOptions[] = [];

        if (this.moduleOptions.handleEvents) {
            messageHandlers = this.handlersManager.getHandlersProperties();
            replyHandlers = this.repliesManager.getHandlersProperties();
        }

        let handlers: IHandlerProperties[] = messageHandlers.concat(replyHandlers);

        _.forEach(handlers, handler => {
            bindings.push({
                exchange: handler.exchange,
                queue: handler.queue,
                keys: [handler.eventName]
            })
        });

        return bindings;
    }

    private _createHandlers(symbol: string, manager: BaseHandlersManager, defaultQueue: string) {

        let exported = Util.findAllReflectData<IHandlerMetadata>(symbol, this.app.parent.exported);

        _.forEach(exported, (item) => this._createHandler(item.fn, item.define, item.metaData, manager, defaultQueue))
    }

    private _createHandler(fn: Function, define: Define, metaData: IHandlerMetadata, manager: BaseHandlersManager, defaultQueue: string) {


        _.forEach(metaData, handler => {

            _.forEach(handler.events, item => {

                let options = item.options || {};

                let queue = this.appendEnv(options.queue) || defaultQueue,
                    exchange = this.appendEnv(options.exchange) || this.getDefaultExchangeName(),
                    routingKey = options.routingKey || item.eventName;

                if(!queue){
                    throw new Error(`no queue defined for ${item.eventName}`)
                }

                if(!exchange){
                    throw new Error(`no exchange defined for ${item.eventName}`)
                }


                options = Object.assign({}, item.options, {queue, exchange, routingKey});

                manager.register(item.eventName, options, define, handler.propertyKey)
            })
        });
    }


}
