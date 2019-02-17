import {define, inject, Injector, singleton} from "appolo/index";
import {IClient, IHandler, IMessage} from "../common/interfaces";
import {HandlersManager} from "../handlers/handlersManager";
import {RepliesManager} from "../handlers/repliesManager";
import {TopologyManager} from "../topology/topologyManager";
import {ILogger} from "@appolo/logger/index";
import * as _ from "lodash";
import {BusProvider} from "../bus/busProvider";
import {RequestError} from "../common/requestError";

@define()
@singleton()
export class MessageManager {

    @inject() protected client: IClient;
    @inject() protected injector: Injector;
    @inject() private handlersManager: HandlersManager;
    @inject() private repliesManager: RepliesManager;
    @inject() private topologyManager: TopologyManager;
    @inject() protected logger: ILogger;
    @inject() protected busProvider: BusProvider;

    private _handler: any;

    public async initialize() {

        this._handler = this.client.handle("#", msg => this._handleMessage(msg));

        if (this.handlersManager.keys.length) {
            this.client.startSubscription(this.topologyManager.queueName, false, this.topologyManager.connectionName);

            this.logger.info(`bus handler subscription ${this.handlersManager.keys.join(",")}`);
        }

        if (this.repliesManager.keys.length) {

            this.client.startSubscription(this.topologyManager.queueNameRequest, false, this.topologyManager.connectionName);
            this.logger.info(`bus reply subscription ${this.repliesManager.keys.join(",")}`);
        }
    }


    private async _handleMessage(msg: IMessage<any>) {

        this._extendMessage(msg);

        let handlers = this.handlersManager.getHandlers(msg.type);

        //we have handler
        if (handlers.length) {
            await Promise.all(_.map(handlers, handler => this._callHandler(msg, handler)));
            return;
        }

        let replies = this.repliesManager.getHandlers(msg.type);

        //we have replies
        if (replies.length) {
            await this._callReply(msg, replies[0]);
            return;
        }

        //ack the message if do not have  a handler
        msg.ack();

    }

    private async _callHandler(msg: IMessage<any>, handler: IHandler) {

        try {
            let instance = this.injector.parent.get(handler.define.definition.id);

            await instance[handler.propertyKey](msg);
            if (!msg.sent) {
                msg.ack();
            }

        } catch (e) {

            this.logger.error(`failed to handle message ${msg.type}`, {err: e, msg: msg});

            if (!msg.sent) {
                msg.nack();
            }

        }
    }

    private async _callReply(msg: IMessage<any>, handler: IHandler) {

        try {
            let instance = this.injector.parent.get(handler.define.definition.id);

            let data = await instance[handler.propertyKey](msg);

            if (!msg.sent) {
                msg.replySuccess(data)
            }

        } catch (e) {
            if (!msg.sent) {
                msg.replyError(e)
            }

        }
    }

    private _extendMessage(msg: IMessage<any>) {
        let oldAck = msg.ack;
        let oldReject = msg.reject;
        let oldNack = msg.nack;
        let oldReply = msg.reply;

        msg.ack = function () {
            this.sent = true;
            return oldAck.apply(this, arguments);
        };

        msg.reject = function () {
            this.sent = true;
            return oldReject.apply(this, arguments);
        };

        msg.nack = function () {
            this.sent = true;
            return oldNack.apply(this, arguments);
        };

        msg.reply = function () {
            this.sent = true;
            return oldReply.apply(this, arguments);
        };

        msg.replySuccess = function <T>(data?: T) {
            return this.reply({
                success: true,
                data: data
            })
        };

        msg.replyError = function <T>(e: RequestError<T>) {
            return this.reply({
                success: false,
                message: e && e.message,
                data: e && e.data
            })
        }
    }


    public clean() {
        if (this.handlersManager.keys.length) {
            this.client.stopSubscription(this.topologyManager.queueName, this.topologyManager.connectionName);
        }

        if (this.repliesManager.keys.length) {
            this.client.stopSubscription(this.topologyManager.queueNameRequest, this.topologyManager.connectionName);
        }

        this._handler.remove();

        this.repliesManager.clean();
        this.handlersManager.clean();

        this._handler = null;
    }

}