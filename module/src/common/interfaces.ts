import {Define} from "appolo/index";
import {RequestError} from "./requestError";

export interface IClient {
    startSubscription(queue: string, exclusive: boolean, connectionName: string);

    stopSubscription(queue: string, connectionName: string);

    handle(route: string, handler: Function);

    publish(exchange: string, params: any, connectionName: string);

    request(exchange: string, params: any, notify: any, connectionName: string);

    close(connectionName: string, reset: boolean): void
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
    type: 'direct' | 'fanout' | 'topic'
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
    sent?: boolean
    type: string

    ack(): void

    nack(): void

    reject(data?: any): void

    reply(data?: any): void

    replySuccess<T, K>( data?: T)

    replyError<T, K>(e: RequestError<T>)


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
