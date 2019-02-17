import {createApp,App} from 'appolo'
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
    let app:App;

    beforeEach(async ()=>{
         app = createApp({root: __dirname, environment: "production", port: 8181});

        await app.module(new BusModule({queueName: "bus-test", connection: process.env.AMPQ, exchangeName: "vidazoo"}));

        await app.launch();
    });

    afterEach(async ()=>{

        await app.reset();
    });

    it("should request reply", async () => {


        let publisher = app.injector.get<MessagePublisher>(MessagePublisher);
        //let handler = app.injector.get<MessageHandler>(MessageHandler);

        let data = await publisher.requestMethod("aa");

        data.result.should.be.eq("aaworking")

    })

    it("should load bus", async () => {


        let publisher = app.injector.get<MessagePublisher>(MessagePublisher);
        let handler = app.injector.get<MessageHandler>(MessageHandler);

        let spy = sinon.spy(handler, "handle");

        await publisher.publishMethod("aa");

        await delay(1000);

        spy.should.have.been.calledOnce;

        spy.getCall(0).args[0].body.test.should.be.eq("aa");


    });


});


