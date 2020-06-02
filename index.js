"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.params = exports.Message = void 0;
const appolo_rabbit_1 = require("appolo-rabbit");
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return appolo_rabbit_1.Message; } });
var busProvider_1 = require("./module/src/bus/busProvider");
Object.defineProperty(exports, "BusProvider", { enumerable: true, get: function () { return busProvider_1.BusProvider; } });
var publisher_1 = require("./module/src/bus/publisher");
Object.defineProperty(exports, "Publisher", { enumerable: true, get: function () { return publisher_1.Publisher; } });
var decorators_1 = require("./module/src/common/decorators");
Object.defineProperty(exports, "reply", { enumerable: true, get: function () { return decorators_1.reply; } });
Object.defineProperty(exports, "request", { enumerable: true, get: function () { return decorators_1.request; } });
Object.defineProperty(exports, "publisher", { enumerable: true, get: function () { return decorators_1.publisher; } });
Object.defineProperty(exports, "handler", { enumerable: true, get: function () { return decorators_1.handler; } });
var busModule_1 = require("./module/busModule");
Object.defineProperty(exports, "BusModule", { enumerable: true, get: function () { return busModule_1.BusModule; } });
function params(data) {
    return data;
}
exports.params = params;
//# sourceMappingURL=index.js.map