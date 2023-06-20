"use strict";
import {define, inject, singleton} from '@appolo/inject'
import {App} from '@appolo/engine'
import {IOptions} from "../common/IOptions";
import {ILogger} from '@appolo/logger';
import {HttpService} from '@appolo/http';
import {Rabbit, IPublishOptions, IRequestOptions, IConnectionOptions, RabbitApi} from "appolo-rabbit";
import {TopologyManager} from "../topology/topologyManager";
import {MessageManager} from "../messages/messageManager";
import {PassThrough} from "stream";
import {Promises} from "@appolo/utils";
import {IPublishProviderOptions} from "../common/interfaces";
import url = require("url");

@define()
@singleton()
export class BusProvider {

    @inject() protected logger: ILogger;
    @inject() protected moduleOptions: IOptions;
    @inject() protected topologyManager: TopologyManager;
    @inject() protected client: Rabbit;
    @inject() protected messageManager: MessageManager;
    @inject() protected httpService: HttpService;
    @inject() protected app: App;

    private _inInitialized: boolean = false;

    private _isClosed = false;

    private _connectionRetries: number = 0;

    public async initialize() {

        if (this._inInitialized) {
            return;
        }
        await this.messageManager.initialize();
        this._inInitialized = true;

        this.app.event.beforeReset.once(() => this.close())

        process.on('exit', () => this.close());

        this.client.on('closed', this._onRabbitClosed, this);
        this.client.on('failed', this._onRabbitFailed, this);
        this.client.on('connected', this._onRabbitConnected, this);

    }

    private _onRabbitConnected() {
        this._connectionRetries = 0;
        this._isClosed = false;
    }

    private _onRabbitClosed(err: Error) {

        if (this._isClosed) {
            return;
        }

        this.logger.error("connection to rabbit unreachable", {err: err});
        (this.topologyManager.envName != "testing") && process.exit(1);
    }

    private async _onRabbitFailed(err: Error) {
        this.logger.error("connection to rabbit failed", {err: err});

        if (this._connectionRetries <= this.moduleOptions.connectionRetries) {

            this._connectionRetries++;

            this.logger.error(`connection to rabbit failed reconnecting attempt: ${this._connectionRetries}`, {err: err});


            await Promises.delay(1000);

            let [e] = await Promises.to<any, Error>(this.client.reconnect());

            if (e) {
                this._onRabbitFailed(e);
            }

        } else {
            (this.topologyManager.envName != "testing") && process.exit(1);
        }

    }

    public publish(routingKey: string | IPublishProviderOptions, type?: string, data?: any, expire?: number): Promise<void>
    public publish(opts: IPublishProviderOptions): Promise<void> {


        if (arguments.length > 1) {
            opts = {
                routingKey: arguments[0],
                type: arguments[1],
                data: arguments[2],
                expire: arguments[3]
            };
        }

        let {params, exchange} = this._createPublishParams(opts);

        return this.client.publish(exchange, params);
    }

    public async request<T>(routingKey: string | IPublishProviderOptions, type?: string, data?: any, expire?: number): Promise<T>
    public async request<T>(opts: IPublishProviderOptions): Promise<T> {

        if (arguments.length > 1) {
            opts = {
                routingKey: arguments[0],
                type: arguments[1],
                data: arguments[2],
                expire: arguments[3]
            };
        }

        let {params, exchange} = this._createPublishParams(opts);

        if (params.expiration) {
            (params as IRequestOptions).replyTimeout = params.expiration || this.moduleOptions.replyTimeout;
        }

        let result = await this.client.request<T>(exchange, params);

        return result;
    }

    public async requestStream<T>(opts: {
        routingKey?: string,
        type: string,
        data: any,
        expire?: number,
        queue?: string,
        exchange?: string
    }): Promise<PassThrough> {

        let {params, exchange} = this._createPublishParams(opts);

        if (params.expiration) {
            (params as IRequestOptions).replyTimeout = params.expiration || this.moduleOptions.replyTimeout;
        }

        let stream = await this.client.requestStream<T>(exchange, params);

        return stream;
    }

    private _createPublishParams(opts: IPublishProviderOptions): { params: IPublishOptions, exchange: string } {
        let queue = this.topologyManager.appendEnv(opts.queue) || this.topologyManager.getDefaultRequestQueueName(),
            exchange = this.topologyManager.appendEnv(opts.exchange) || this.topologyManager.getDefaultExchangeName();


        let params: IPublishOptions = {
            type: opts.type,
            body: opts.data,
            routingKey: opts.routingKey || opts.type,
            delay: opts.delay,
            debounce: opts.debounce,
            throttle: opts.throttle,
            deduplicationId: opts.deduplicationId,
            retry: opts.retry,
            headers: {
                ...opts.headers,
                queue: queue
            }

        };

        if (opts.expire) {
            params.expiration = opts.expire;
        }

        return {exchange, params}

    }

    public async close() {

        if (this._isClosed) {
            return;
        }

        this._isClosed = true;

        await this.messageManager.clean();

        await this.client.close();
    }

    public async getQueueMessagesCount(params: { queue: string, connection?: string }): Promise<number> {

        let {queue, connection} = params;

        queue = this.topologyManager.appendEnv(queue) || this.topologyManager.getDefaultQueueName();

        let apiQueue = await this.client.api.getQueue({name: queue, connection});

        return apiQueue ? apiQueue.messages : 0;
    }

    public api(): RabbitApi {
        return this.client.api;
    }

    public async addHandlerClass(fn: Function) {

        let result = this.topologyManager.addMessageHandler(fn);

        await Promises.map(result, item => this.bindToQueue({...item.options, type: item.eventName}))
    }

    public async addReplyClass(fn: Function) {
        let result = this.topologyManager.addReplyMessageHandler(fn);

        await Promises.map(result, item => this.bindToQueue({...item.options, type: item.eventName}))
    }

    public bindToQueue(options: { queue: string, exchange: string, routingKey?: string, type: string }) {
        return this.client.bind({
            exchange: options.exchange, queue: options.queue, keys: [options.routingKey || options.type]
        })
    }
}
