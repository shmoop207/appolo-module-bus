"use strict";
import {IOptions} from "./module/src/common/IOptions";
import {BusProvider} from "./module/src/bus/busProvider";
import {Rabbit, IPublishOptions, IRequestOptions, IMessage, Message, IQueueOptions} from "appolo-rabbit";

export {IOptions}  from "./module/src/common/IOptions"

export {IHandler,} from "./module/src/common/interfaces"
export {BusProvider} from "./module/src/bus/busProvider"
export {Publisher} from "./module/src/bus/publisher"
export {reply, request, publisher, handler} from "./module/src/common/decorators"
export {BusModule} from "./module/busModule"

export {IPublishOptions, IRequestOptions, IMessage, Message, IQueueOptions}

export function params<T>(data: any): Promise<T> {
    return data
}

