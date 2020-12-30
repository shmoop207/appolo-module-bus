import {createApp, App} from '@appolo/engine'
import {BusModule, BusProvider} from "../index";
import {MessagePublisher} from "./src/publisher";
import {MessageHandler} from "./src/handler";
import chai = require('chai');
import sinon = require('sinon');
import    sinonChai = require("sinon-chai");

let should = require('chai').should();
chai.use(sinonChai);

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}


describe("bus module Spec", function () {
    let app: App;

    beforeEach(async () => {
        app = createApp({root: __dirname, environment: "testing"});

        await app.module.use(BusModule.for({
            queue: "bus-test",
            requestQueue: "bus-test-request",
            replyQueue: "bus-test-reply",
            connection: process.env.RABBIT,
            exchange: "vidazoo"
        }));

        await app.launch();
    });

    afterEach(async () => {

        let busProvider = app.injector.get<BusProvider>(BusProvider);

        await busProvider.close();

        await app.reset();
    });

    it("should request reply", async () => {


        let publisher = app.injector.get<MessagePublisher>(MessagePublisher);

        let data = await publisher.requestMethod("aa");

        data.result.should.be.eq("aaworking")

    });

    it("should load bus and call handle message", async () => {


        let publisher = app.injector.get<MessagePublisher>(MessagePublisher);
        let handler = app.injector.get<MessageHandler>(MessageHandler);
        let busProvider = app.injector.get<BusProvider>(BusProvider);

      // await busProvider.addHandlerClass(MessageHandler)

        let spy = sinon.spy(handler, "handle");

        await publisher.publishMethod("aa");

        await delay(1000);

        spy.should.have.been.calledOnce;

        spy.getCall(0).args[0].body.test.should.be.eq("aa");


    });


});


