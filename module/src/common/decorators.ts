import "reflect-metadata";
import {Util} from 'appolo';
import {IHandlerMetadata, IPublisherMetadata} from "./interfaces";

export const HandlerSymbol = Symbol("HandlerSymbol");
export const PublisherSymbol = Symbol("PublisherSymbol");
export const RequestSymbol = Symbol("RequestSymbol");
export const ReplySymbol = Symbol("ReplySymbol");


function defineHandler(eventName, symbol: Symbol) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.getReflectData<IHandlerMetadata>(symbol, target.constructor, {});


        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventNames: [],
                propertyKey,
                descriptor
            };
        }

        data[propertyKey].eventNames.push(
            eventName);
    }
}

function definePublisher(eventName, symbol: Symbol,expire:number) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.getReflectData<IPublisherMetadata>(symbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventName,
                propertyKey,
                expire,
                descriptor
            };
        }
    }
}

export function handler(eventName: string) {
    return defineHandler(eventName, HandlerSymbol)
}

export function reply(eventName: string) {
    return defineHandler(eventName, ReplySymbol)
}

export function publisher(eventName: string, expire?: number) {
    return definePublisher(eventName, PublisherSymbol,expire)
}

export function request(eventName: string, expire?: number) {
    return definePublisher(eventName, RequestSymbol,expire)
}




