import {define, inject, Injector, singleton} from "appolo/index";
import {IClient, IHandler, IMessage} from "../common/interfaces";
import {HandlersManager} from "../handlers/handlersManager";
import {RepliesManager} from "../handlers/repliesManager";
import {TopologyManager} from "../topology/topologyManager";
import {ILogger} from "@appolo/logger/index";
import * as _ from "lodash";
import {BusProvider} from "../bus/busProvider";

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

    public async initialize() {

        this.client.handle("#", msg => this._handleMessage(msg));

        if (this.handlersManager.keys.length) {
            this.client.startSubscription(this.topologyManager.queueName);

            this.logger.info(`bus handler subscription ${this.handlersManager.keys.join(",")}`);
        }

        if (this.repliesManager.keys.length) {

            this.client.startSubscription(this.topologyManager.queueNameRequest);
            this.logger.info(`bus reply subscription ${this.repliesManager.keys.join(",")}`);
        }
    }

    private async _handleMessage(msg: IMessage<any>) {

        let handlers = this.handlersManager.getHandlers(msg.type);

        //we have handler
        if (handlers.length) {
            await Promise.all(_.map(handlers, handler => this._callHandler(msg, handler)))
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

            msg.ack();

        } catch (e) {

            this.logger.error(`failed to handle message ${msg.type}`, {err: e, msg: msg});

            msg.nack();
        }
    }

    private async _callReply(msg: IMessage<any>, handler: IHandler) {

        try {
            let instance = this.injector.parent.get(handler.define.definition.id);

            let data = await instance[handler.propertyKey](msg);

            this.busProvider.replySuccess(msg, data)

        } catch (e) {

            this.busProvider.replyError(msg, e)
        }
    }

}