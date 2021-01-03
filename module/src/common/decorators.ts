import "reflect-metadata";
import {Reflector} from '@appolo/utils';
import {IHandlerMetadata, IHandlerMetadataOptions, IPublisherMetadata, IPublisherMetaOptions} from "./interfaces";
import {IApp} from "@appolo/engine/index";

export const HandlerSymbol = "__HandlerSymbol__";
export const PublisherSymbol = "__PublisherSymbol__";
export const RequestSymbol = "__RequestSymbol__";
export const ReplySymbol = "__ReplySymbol__";


function defineHandler(eventName: string|((app: IApp) => string), options: IHandlerMetadataOptions, symbol: string) {
    return function (target: any, propertyKey: string, descriptor?: PropertyDescriptor) {

        let data = Reflector.getFnMetadata<IHandlerMetadata>(symbol, target.constructor, {});


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

        let data = Reflector.getFnMetadata<IPublisherMetadata>(symbol, target.constructor, {});

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

export function handler(eventName: string|((app: IApp) => string), options?: IHandlerMetadataOptions) {
    return defineHandler(eventName, options, HandlerSymbol)
}

export function reply(eventName: string|((app: IApp) => string), options?: IHandlerMetadataOptions) {
    return defineHandler(eventName, options, ReplySymbol)
}

export function publisher(eventName: string, options?: IPublisherMetaOptions) {
    return definePublisher(eventName, PublisherSymbol, options)
}

export function request(eventName: string, options?: IPublisherMetaOptions) {
    return definePublisher(eventName, RequestSymbol, options)
}




