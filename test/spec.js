"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appolo_1 = require("appolo");
const index_1 = require("../index");
const publisher_1 = require("./src/publisher");
const handler_1 = require("./src/handler");
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
let should = require('chai').should();
chai.use(sinonChai);
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
describe("bus module Spec", function () {
    let app;
    beforeEach(async () => {
        app = appolo_1.createApp({ root: __dirname, environment: "production", port: 8181 });
        await app.module(new index_1.BusModule({ queueName: "bus-test", connection: process.env.AMPQ, exchangeName: "vidazoo" }));
        await app.launch();
    });
    afterEach(async () => {
        await app.reset();
    });
    it("should request reply", async () => {
        let publisher = app.injector.get(publisher_1.MessagePublisher);
        //let handler = app.injector.get<MessageHandler>(MessageHandler);
        let data = await publisher.requestMethod("aa");
        data.result.should.be.eq("aaworking");
    });
    it("should load bus", async () => {
        let publisher = app.injector.get(publisher_1.MessagePublisher);
        let handler = app.injector.get(handler_1.MessageHandler);
        let spy = sinon.spy(handler, "handle");
        await publisher.publishMethod("aa");
        await delay(1000);
        spy.should.have.been.calledOnce;
        spy.getCall(0).args[0].body.test.should.be.eq("aa");
    });
});
//# sourceMappingURL=spec.js.map