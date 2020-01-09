"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Defaults = {
    id: "busProvider",
    handleEvents: true,
    autoListen: true,
    addEnvToNames: true,
    replyTimeout: 1000 * 60 * 5,
};
exports.ExchangeDefaults = {
    type: "topic",
    persistent: true,
    durable: true
};
exports.QueueDefaults = {
    subscribe: false,
    durable: true,
    autoDelete: false,
    limit: 1
};
exports.RequestQueueDefaults = {
    subscribe: false,
    durable: false,
    autoDelete: false,
    noAck: false,
    limit: 10,
    messageTtl: 1000 * 60 * 10
};
exports.ReplyQueueDefaults = {
    subscribe: false,
    durable: false,
    autoDelete: true,
    noAck: true,
    limit: 1000,
    expires: 10000,
    messageTtl: 1000 * 60 * 10
};
//# sourceMappingURL=defaults.js.map