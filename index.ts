"use strict";
import {IOptions} from "./module/src/common/IOptions";
import {BusProvider} from "./module/src/bus/busProvider";
export {IOptions}  from "./module/src/common/IOptions"

export {IQueue,IHandler,IMessage} from "./module/src/common/interfaces"
export {BusProvider} from "./module/src/bus/busProvider"
export {Publisher} from "./module/src/bus/publisher"
export {reply, request, publisher, handler} from "./module/src/common/decorators"
export {BusModule} from "./module/busModule"

export function params<T>(data:any):Promise<T>{
    return data
}

