import {IModuleOptions} from 'appolo';
import {IExchange, IQueue} from "./interfaces";

export interface IOptions extends IModuleOptions {
    id?: string;
    connection: string;
    auto?: boolean;
    listener?: boolean;
    queueName: string;
    exchangeName: string;
    appendEnv?:boolean
    queue?: IQueue;
    exchange?: IExchange;
    requestQueue?: IQueue;
    replayQueue?: IQueue | false;
    replyTimeout?:number
}