import {define, IEnv, inject, singleton} from "appolo/index";
import {IOptions} from "../common/IOptions";
import {HandlersManager} from "../handlers/handlersManager";
import {RepliesManager} from "../handlers/repliesManager";
import uuid = require('uuid');
import url = require("url");

@define()
@singleton()
export class TopologyManager {
    @inject() private moduleOptions: IOptions;
    @inject() private env: IEnv;
    @inject() private handlersManager: HandlersManager;
    @inject() private repliesManager: RepliesManager;

    public get exchangeName(): string {
        return this.appendEnv(this.moduleOptions.exchangeName);
    }

    public appendEnv(name: string): string {
        return this.moduleOptions.appendEnv ? (`${name}-${this.envName}`) : name;
    }

    public get envName(): string {
        return this.env.name || this.env.type || "production";
    }

    public get queueName(): string {
        return this.appendEnv(this.moduleOptions.queueName)
    }

    public get queueNameRequest(): string {
        return `${this.queueName}-request`
    }

    public get queueNameReply(): string {
        return `${this.queueName}-reply-${uuid.v4()}`;
    }


    public buildTopology(): any {
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
            })
        }

        if (replyHandlerKeys.length) {
            config.bindings.push({
                exchange: this.exchangeName,
                target: this.queueNameRequest,
                keys: replyHandlerKeys
            })
        }

        return config;
    }
}