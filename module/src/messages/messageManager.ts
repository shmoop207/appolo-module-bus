import {define, inject, Injector, singleton} from "@appolo/inject";
import {IHandler} from "../common/interfaces";
import {HandlersManager} from "../handlers/handlersManager";
import {RepliesManager} from "../handlers/repliesManager";
import {TopologyManager} from "../topology/topologyManager";
import {ILogger} from "@appolo/logger/index";
import {Promises} from "@appolo/utils";
import {BusProvider} from "../bus/busProvider";
import {RequestError} from "../common/requestError";
import {Rabbit, Message, Handler} from "appolo-rabbit";

@define()
@singleton()
export class MessageManager {

    @inject() protected client: Rabbit;
    @inject() protected injector: Injector;
    @inject() private handlersManager: HandlersManager;
    @inject() private repliesManager: RepliesManager;
    @inject() private topologyManager: TopologyManager;
    @inject() protected logger: ILogger;
    @inject() protected busProvider: BusProvider;

    private _handler: Handler;
    private _handlerRequest: Handler;
    private _initialized = false;

    public async initialize() {

        this._handler = this.client.handle({
            type: "#",
            handler: msg => this._handleMessage(msg),
            queue: this.topologyManager.getDefaultQueueName()
        });

        this._handlerRequest = this.client.handle({
            type: "#",
            handler: msg => this._handleRequestMessage(msg),
            queue: this.topologyManager.getDefaultRequestQueueName()
        });

        await this.client.subscribe();

        let handlers = this.handlersManager.getHandlersProperties();

        if (handlers.length) {
            this.logger.info(`bus handlers subscription ${handlers.map((item) => item.eventName).join(",")}`);
        }

        let replyHandlers = this.repliesManager.getHandlersProperties()

        if (replyHandlers.length) {
            this.logger.info(`bus reply subscription ${replyHandlers.map((item) => item.eventName).join(",")}`);
        }

        this._initialized = true;

    }

    private async _handleRequestMessage(msg: Message<any>) {

        let replies = this.repliesManager.getHandlers(msg.type, msg.queue, msg.fields.exchange, msg.fields.routingKey);

        if (replies.length) {
            await this._callReply(msg, replies[0]);
        }

        msg.ack();
    }

    private async _handleMessage(msg: Message<any>) {

        let handlers = this.handlersManager.getHandlers(msg.type, msg.queue, msg.fields.exchange, msg.fields.routingKey);

        if (handlers.length) {
            await Promises.map(handlers || [], handler => this._callHandler(msg, handler));
        }

        msg.ack();
    }

    private async _callHandler(msg: Message<any>, handler: IHandler) {

        try {

            let instance = this._getHandlerInjector(handler).get(handler.define.definition.id);

            if (handler.retry) {
                msg.retry = handler.retry
            }

            await instance[handler.propertyKey](msg);
            if (!msg.isAcked) {
                msg.ack();
            }

        } catch (e) {

            this.logger.error(`failed to handle message ${msg.type}`, {err: e, msg: msg.body});

            if (!msg.isAcked) {
                msg.nack();
            }

        }
    }

    private _getHandlerInjector(handler: IHandler): Injector {
        let def = handler.define.definition,
            injector = def.injector && def.injector.hasDefinition(def.id)
                ? def.injector
                : this.injector.parent;

        return injector;
    }

    private async _callReply(msg: Message<any>, handler: IHandler) {

        try {

            let instance = this._getHandlerInjector(handler).get(handler.define.definition.id);

            let data = await instance[handler.propertyKey](msg);

            if (!msg.isAcked) {
                msg.replyResolve(data)
            }

        } catch (e) {
            if (!msg.isAcked) {
                msg.replyReject(e)
            }

        }
    }

    public async clean() {

        if (this._initialized) {
            await this.client.unSubscribe();

            this._handler.remove();
            this._handlerRequest.remove();
        }

        this.repliesManager.clean();
        this.handlersManager.clean();

        this._handler = null;
    }

}
