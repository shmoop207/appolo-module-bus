import {IOptions} from "./IOptions";

export const Defaults = <Partial<IOptions>>{
    id: "busProvider",
    listener: true,
    auto: true,
    appendEnv: true,
    replyTimeout: 1000 * 60 * 5,
    exchange: {
        type: "topic",
        persistent: true,
        durable: true
    },
    queue: {
        subscribe: false,
        durable: true,
        autoDelete: false,
        limit: 1
    },
    requestQueue: {
        subscribe: false,
        durable: false,
        autoDelete: true,
        noAck: false,
        limit: 10,
        messageTtl: 1000 * 60 * 10
    },
    replayQueue: {
        subscribe: true,
        durable: false,
        autoDelete: true,
        persistent: false,
        noAck: true,
        limit: 1000,
        expires: 500,
        messageTtl: 1000 * 60 * 10
    }
}