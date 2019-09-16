import {IModuleOptions} from 'appolo';
import {IExchangeOptions, IQueueOptions, IConnectionOptions} from "appolo-rabbit";

export interface IOptions extends IModuleOptions {
    id?: string;
    connection: string | IConnectionOptions;
    autoListen?: boolean;
    handleEvents?: boolean;
    addEnvToNames?: boolean
    exchanges?: IExchangeOptions[]
    exchange?: string | IExchangeOptions
    queues?: IQueueOptions[]
    queue?: string | IQueueOptions
    requestQueue?: string | IQueueOptions
    requestQueues?: IQueueOptions[]
    replyQueue?: string | IQueueOptions
    replyTimeout?: number
}
