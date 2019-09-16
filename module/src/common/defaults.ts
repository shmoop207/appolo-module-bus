import {IOptions} from "./IOptions";
import {IQueueOptions, IExchangeOptions} from "appolo-rabbit";

export const Defaults: Partial<IOptions> = {
    id: "busProvider",
    handleEvents: true,
    autoListen: true,
    addEnvToNames: true,
    replyTimeout: 1000 * 60 * 5,
}

export const ExchangeDefaults: Partial<IExchangeOptions> = {
    type: "topic",
    persistent: true,
    durable: true
}

export const QueueDefaults: Partial<IQueueOptions> = {
    subscribe: false,
    durable: true,
    autoDelete: false,
    limit: 1
};

export const RequestQueueDefaults: Partial<IQueueOptions> = {
    subscribe: false,
    durable: false,
    autoDelete: true,
    noAck: false,
    limit: 10,
    messageTtl: 1000 * 60 * 10
};

export const ReplyQueueDefaults: Partial<IQueueOptions> = {
    subscribe: true,
    durable: false,
    autoDelete: true,
    noAck: true,
    limit: 1000,
    expires: 500,
    messageTtl: 1000 * 60 * 10
}
