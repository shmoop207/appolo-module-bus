import {Define} from "appolo/index";

export interface IClient {
    startSubscription(queue: string);

    handle(route: string, handler: Function);

    publish(exchange: string, params: any);

    request(exchange: string, params: any);
}

export interface IHandler {
    define: Define,
    propertyKey: string
}

export interface IQueue {
    name?: string,
    subscribe?: boolean,
    durable?: boolean,
    autoDelete?: boolean,
    persistent?: boolean,
    noAck?: boolean,
    limit?: number,
    expires?: number,
    messageTtl?: number
}

export interface IExchange {
    name?: string
    type: string
    persistent: boolean
    durable: boolean
}

export interface IMessage<T> {
    fields: {
        consumerTag: string
        deliveryTag: string
        redelivered: boolean,
        exchange: string
        routingKey: string
    },
    properties: {
        contentType: string,
        contentEncoding: string,
        headers: any,
        correlationId: string,
        replyTo: string,
        messageId: string,
        type: string,
        appId: string
    },
    body: T,
    type: string

    ack(): void

    nack(): void

    reject(data?: any): void

    reply(data?: any): void
}

export interface IHandlerMetadata {
    [index: string]: {
        eventNames: string[]
        propertyKey: string,
        descriptor: PropertyDescriptor
    }
}

export interface IPublisherMetadata {
    [index: string]: PublisherMeta
}

export type  PublisherMeta = {

    eventName: string
    expire: number
    propertyKey: string,
    descriptor: PropertyDescriptor

}
