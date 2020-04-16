"use strict";
import {define, inject, singleton, App, Events} from 'appolo'
import {IOptions} from "../common/IOptions";
import {ILogger} from '@appolo/logger';
import {HttpService} from '@appolo/http';
import {Rabbit, IPublishOptions, IRequestOptions} from "appolo-rabbit";
import {TopologyManager} from "../topology/topologyManager";
import {MessageManager} from "../messages/messageManager";
import {PassThrough} from "stream";
import {IPublishProviderOptions} from "../common/interfaces";

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

    public async initialize() {

        if (!this._inInitialized) {
            await this.messageManager.initialize();
            this._inInitialized = true;

            this.app.once(Events.BeforeReset, () => this.close())
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

    public async request<T>(routingKey: string | Object, type?: string, data?: any, expire?: number): Promise<T>
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

    public async requestStream<T>(opts: { routingKey?: string, type: string, data: any, expire?: number, queue?: string, exchange?: string }): Promise<PassThrough> {

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
            headers: {
                queue: queue
            }

        };

        if (opts.expire) {
            params.expiration = opts.expire;
        }

        return {exchange, params}

    }

    public async close() {
        await this.messageManager.clean();

        await this.client.close();
    }

    public async getQueueMessagesCount(queue: string): Promise<number> {

        queue = this.topologyManager.appendEnv(queue) || this.topologyManager.getDefaultQueueName();

        try {
            let connection = this.topologyManager.connection;

            let params = {
                json: true,
                url: `https://${connection.username}:${connection.password}@${connection.hostname}/api/queues/${connection.vhost}/${queue}`
            };

            let res = await this.httpService.request<{ messages: number }>(params);

            return res.data.messages;
        } catch (e) {
            this.logger.error(`failed to get messages count from ${queue}`);
            throw e;

        }


    }
}
