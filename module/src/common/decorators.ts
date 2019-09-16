import "reflect-metadata";
import {Util} from 'appolo';
import {IHandlerMetadata, IHandlerMetadataOptions, IPublisherMetadata, IPublisherMetaOptions} from "./interfaces";

export const HandlerSymbol = "__HandlerSymbol__";
export const PublisherSymbol = "__PublisherSymbol__";
export const RequestSymbol = "__RequestSymbol__";
export const ReplySymbol = "__ReplySymbol__";


function defineHandler(eventName: string, options: IHandlerMetadataOptions, symbol: string) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.getReflectData<IHandlerMetadata>(symbol, target.constructor, {});


        if (!data[propertyKey]) {
            data[propertyKey] = {
                events: [],
                propertyKey,
                descriptor
            };
        }

        data[propertyKey].events.push(
            {eventName, options: options || {}});
    }
}

function definePublisher(eventName, symbol: string, options?: IPublisherMetaOptions) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Util.getReflectData<IPublisherMetadata>(symbol, target.constructor, {});

        if (!data[propertyKey]) {
            data[propertyKey] = {
                eventName,
                propertyKey,
                options,
                descriptor
            };
        }
    }
}

export function handler(eventName: string, options?: IHandlerMetadataOptions) {
    return defineHandler(eventName, options, HandlerSymbol)
}

export function reply(eventName: string, options?: IHandlerMetadataOptions) {
    return defineHandler(eventName, options, ReplySymbol)
}

export function publisher(eventName: string, options?: IPublisherMetaOptions) {
    return definePublisher(eventName, PublisherSymbol, options)
}

export function request(eventName: string, options?: IPublisherMetaOptions) {
    return definePublisher(eventName, RequestSymbol, options)
}




