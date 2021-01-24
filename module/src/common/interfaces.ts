import {Define} from "@appolo/inject";
import {IApp} from "@appolo/engine";
import {IRetry} from "appolo-rabbit";
import {RequestError} from "./requestError";

// export interface IClient {
//     startSubscription(queue: string, exclusive: boolean, connectionName: string);
//
//     stopSubscription(queue: string, connectionName: string);
//
//     handle(route: string, handler: Function);
//
//     publish(exchange: string, params: any, connectionName: string);
//
//     request(exchange: string, params: any, notify: any, connectionName: string);
//
//     close(connectionName: string, reset: boolean): void
// }

export interface IHandler {
    define: Define,
    propertyKey: string,
}

export interface IHandlerProperties {
    queue: string,
    exchange: string,
    eventName: string,
    routingKey: string
    handlers: IHandler[]
}


export interface IHandlerMetadata {
    [index: string]: {
        events: { eventName: string | ((app: IApp) => string), options: IHandlerMetadataOptions }[]
        propertyKey: string,
        descriptor: PropertyDescriptor
    }
}

export interface IHandlerMetadataOptions {
    queue?: string,
    exchange?: string
    routingKey?: string
}

export interface IPublisherMetadata {
    [index: string]: PublisherMeta
}

export type  PublisherMeta = {

    eventName: string
    options?: IPublisherMetaOptions
    propertyKey: string,
    descriptor: PropertyDescriptor

}

export interface IPublisherMetaOptions {
    expire?: number
    exchange?: string
    routingKey: string
}

export interface IPublishProviderOptions {
    routingKey?: string,
    type: string,
    data?: any,
    expire?: number,
    queue?: string,
    exchange?: string
    delay?: number
    retry?: IRetry
    headers?: { [index: string]: any }
}
