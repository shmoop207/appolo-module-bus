"use strict";
const logger_1 = require("@appolo/logger");
module.exports = async function (app) {
    if (!app.injector.hasInstance("logger")) {
        await app.module(logger_1.LoggerModule);
    }
};
//# sourceMappingURL=all.js.map