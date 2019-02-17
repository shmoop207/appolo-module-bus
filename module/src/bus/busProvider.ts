"use strict";
import {define, inject, singleton,App,Events} from 'appolo'
import {IOptions} from "../common/IOptions";
import {ILogger} from '@appolo/logger';
import {HttpService} from '@appolo/http';
import * as _ from 'lodash';
import {IClient, IMessage} from "../common/interfaces";
import {TopologyManager} from "../topology/topologyManager";
import {MessageManager} from "../messages/messageManager";
import uuid = require('uuid');
import url = require('url');
import {RequestError} from "../common/requestError";

@define()
@singleton()
export class BusProvider {

    @inject() protected logger: ILogger;
    @inject() protected moduleOptions: IOptions;
    @inject() protected topologyManager: TopologyManager;
    @inject() protected client: IClient;
    @inject() protected messageManager: MessageManager;
    @inject() protected httpService: HttpService;
    @inject() protected app: App;

    private _inInitialized: boolean = false;

    public async initialize() {

        if (!this._inInitialized) {
            await this.messageManager.initialize();
            this._inInitialized = true;

            this.app.once(Events.BeforeReset, () =>this.close())
        }
    }

    public publish(type: string, data: any, expire?: number): Promise<void> {

        let params = <any>{
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

        return this.client.publish(this.topologyManager.exchangeName, params,this.topologyManager.connectionName);
    }

    public async request<T>(type: string, data: any, expire?: number): Promise<T> {


        expire = expire || this.moduleOptions.replyTimeout;

        let params = <any>{
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

        let msg = await this.client.request(this.topologyManager.exchangeName, params,undefined,this.topologyManager.connectionName);

        if (msg.body.success) {

            return msg.body.data as T

        } else {

            let error = new RequestError(_.isObject(msg.body.message) ? JSON.stringify(msg.body.message) : msg.body.message);

            error.data = msg.body.data;

            throw error;
        }
    }

    public async close(){
        this.messageManager.clean();

        await this.client.close(this.topologyManager.connectionName,true);
    }

    public async getQueueMessagesCount(): Promise<number> {

        try {
            let amqp = url.parse(this.moduleOptions.connection);

            let params = {
                json: true,
                url: `https://${amqp.auth.split(":")[0]}:${amqp.auth.split(":")[1]}@${amqp.hostname}/api/queues/${ amqp.path.substr(1)}/${this.topologyManager.queueName}`
            };

            let res = await this.httpService.request<{ messages: number }>(params);

            return res.data.messages;
        } catch (e) {
            this.logger.error(`failed to get messages count from ${this.topologyManager.queueName}`)
            throw e;

        }


    }
}
