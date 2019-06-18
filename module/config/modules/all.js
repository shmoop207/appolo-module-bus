"use strict";
const logger_1 = require("@appolo/logger");
const http_1 = require("@appolo/http");
module.exports = async function (app) {
    if (!app.injector.hasDefinition("logger")) {
        await app.module(logger_1.LoggerModule);
    }
    await app.module(http_1.HttpModule);
};
//# sourceMappingURL=all.js.map