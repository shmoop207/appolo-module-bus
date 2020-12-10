import {Define, inject, singleton} from '@appolo/inject'
import {IApp} from '@appolo/core'
import * as _ from "lodash";
import {IHandler, IHandlerMetadata, IHandlerMetadataOptions, IHandlerProperties} from "../common/interfaces";
import {TopologyManager} from "../topology/topologyManager";


@singleton()
export abstract class BaseHandlersManager {

    @inject() private app: IApp;

    private _handlers = new Map<string, IHandlerProperties>();

    protected readonly Uniq: boolean = false;


    public register(eventName: string, options: IHandlerMetadataOptions, define: Define, propertyKey: string) {

        let key = this._getKey(eventName, options.queue, options.exchange, options.routingKey);

        if (this.Uniq && this._handlers.has(key)) {
            throw new Error(`replay event handler must be uniq for ${eventName}`)
        }

        if (!this._handlers.has(key)) {
            this._handlers.set(key, {
                handlers: [],
                eventName,
                exchange: options.exchange,
                queue: options.queue,
                routingKey: options.routingKey
            });
        }

        this._handlers.get(key).handlers.push({
            define,
            propertyKey: propertyKey,
        });
    }

    private _getKey(eventName: string, queue: string, exchange: string, routingKey: string): string {
        return `${eventName}##${queue}##${exchange}##${routingKey}`
    }

    public getHandlersProperties(): IHandlerProperties[] {
        return Array.from(this._handlers.values());
    }

    public getHandlers(eventName: string, queue: string, exchange: string, routingKey: string): IHandler[] {

        let key = this._getKey(eventName, queue, exchange, routingKey);

        let handlers = this._handlers.get(key);

        return handlers ? handlers.handlers : [];
    }

    public clean() {
        this._handlers.clear();
    }

}
