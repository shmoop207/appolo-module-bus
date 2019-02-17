---
id: bus
title: Bus
sidebar_label: Bus
---
bus module for [`appolo`](https://github.com/shmoop207/appolo) built with [rabbot](https://github.com/arobson/rabbot)

## Installation

```javascript
npm i @appolo/bus
```

## Options
| key | Description | Type | Default
| --- | --- | --- | --- |
| `id` |  injection id | `string`|  `busProvider`|
| `connection` | AMQP connection string | `string` | null |
| `auto` | true to auto initialize busProvider and start listen to events | `boolean` | `true` |
| `listener` | true to register queue event handlers | `boolean` | `true` |
| `exchangeName` | name of the exchange | `string` |  |
| `queueName` | name of the queue | `string` |  |
| `appendEnv` | append `env` name to queueName and exchangeName  | `boolean` | `true` |
| `exchange` | exchange options  | `object` | `{}` |
| `queue` | queue options  | `object` | `{}` |
| `requestQueue` | request queue options  | `object` | `{}` |
| `replayQueue` | request queue options or `false to disable` | `object` | `{}` |

### Exchange Options
| key | Description | Type | Default
| --- | --- | --- | --- |
| `type` | request queue options or `false to disable` | `string` | `topic` |
| `autoDelete`  | delete when consumer count goes to 0 | boolean | `false` |
| `durable` |  survive broker restarts |boolean | `true` |
| `persistent`  | persistent delivery, messages saved to disk| boolean | `true` |
| `alternate` |   define an alternate exchange | string | |
| `publishTimeout` |  timeout in milliseconds for publish calls to this exchange | `2^32` |
| `replyTimeout` |  timeout in milliseconds to wait for a reply | `2^32` | |
| `limit` |  the number of unpublished messages to cache while waiting on connection | `2^16` | |
| `noConfirm` |  prevents rabbot from creating the exchange in confirm mode | boolean | false |


### Queue Options
| key | Description | Type | Default
| --- | --- | --- | --- |
| `autoDelete` |  delete when consumer count goes to 0 | boolean | `false`|
| `durable` |  survive broker restarts | boolean | `true` |
| `subscribe` |  auto-start the subscription | boolean | `false` |
| `limit` | max number of unacked messages allowed for consumer | 2^16 | `1`|
| `noAck` |  the server will remove messages from the queue as soon as they are delivered | boolean | false |
| `noBatch` |  causes ack, nack & reject to take place immediately | boolean | `false` |
| `noCacheKeys` |  disable cache of matched routing keys to prevent unbounded memory growth | boolean | false |
| `queueLimit` | max number of ready messages a queue can hold | 2^32 | |
| `messageTt` | time in ms before a message expires on the queue | 2^32 | |
| `expires` | time in ms before a queue with 0 consumers expires | 2^32 | |
in config/modules/all.ts

```javascript
import {PubSubModule} from '@appolo/pubsub';

export = async function (app: App) {
   await app.module(new BusModule({redis:"amqp://connection-string"}));
}
```

## Usage

### Publisher
```javascript
import {define, singleton} from 'appolo'
import {publisher} from "@appolo/bus";

@define()
@singleton()
export class SomePublisher {

    @publisher("test")
    async publish(data: any): Promise<any> {
        return data
    }
}
```
Or with BusProvider
```javascript
@define()
@singleton()
export class SomePublisher {

    inject() busProvider:BusProvider

    publish(data:any): Promise<any> {
        return this.busProvider.publish("test",data)
    }
}

```
### Handler
if you don not call msg ack or nack
it will be called on handler return `msg.ack()` or `msg.nack()` on error

```javascript
import {define, singleton} from 'appolo'
import {handler} from "@appolo/bus";

@define()
@singleton()
export class SomeHandler {

    @handler("test")
    handle(msg: IMessage<data>) {
       //do something
    }

    @handler("someName")
    handle(msg: IMessage<data>) {

        try{
           //do some thing

           msg.ack();
        }
        catch(){
            msg.nack();
        }
    }
}
```

### Request
```javascript
import {define, singleton} from 'appolo'
import {request} from "@appolo/bus";

@define()
@singleton()
export class SomePublisher {

    @request("test")
    async getData(data: any): Promise<any> {
        return data
    }

    public async handleData(){
        let data = await this.getData({userId:1})
    }


}
```
Or with BusProvider
```javascript
@define()
@singleton()
export class SomePublisher {

    inject() busProvider:busProvider

    publish(data:any): Promise<any> {
        let data = await  this.busProvider.request("test",data)

        return data;
    }
}

```

### Reply

```javascript
import {define, singleton} from 'appolo'
import {handler} from "@appolo/bus";

@define()
@singleton()
export class SomeHandler {

    inject() busProvider:busProvider


    @reply("test")
    handle(msg: IMessage<data>) {
        return {userId:1}
    }

    // or reply methods
    @reply("someName")
    handle(msg: IMessage<data>) {

        try{
            //get some data
         msg.replySuccess(msg,{userId:1})
        }
        catch(){
            msg.replyError(msg,e)
        }
    }
}
```

## IMessage
each handler and reply handler called with message object
```javascript
{
  // metadata specific to routing & delivery
  fields: {
    consumerTag: "", // identifies the consumer to rabbit
    deliveryTag: #, // identifies the message delivered for rabbit
    redelivered: true|false, // indicates if the message was previously nacked or returned to the queue
    exchange: "" // name of exchange the message was published to,
    routingKey: "" // the routing key (if any) used when published
  },
  properties:{
    contentType: "application/json", // see serialization for how defaults are determined
    contentEncoding: "utf8", // rabbot's default
    headers: {}, // any user provided headers
    correlationId: "", // the correlation id if provided
    replyTo: "", // the reply queue would go here
    messageId: "", // message id if provided
    type: "", // the type of the message published
    appId: "" // not used by rabbot
  },
  content: { "type": "Buffer", "data": [ ... ] }, // raw buffer of message body
  body: , // this could be an object, string, etc - whatever was published
  type: "" // this also contains the type of the message published
}
```

### `message.ack()`
Enqueues the message for acknowledgement.

### `message.nack()`
Enqueues the message for rejection. This will re-enqueue the message.

### `message.reject()`
Rejects the message without re-queueing it. Please use with caution and consider having a dead-letter-exchange assigned to the queue before using this feature.

### `message.reply( data:any )`
Acknowledges the messages and sends the message back to the requestor.

### `message.replySuccess( data:T )`
reply the message with json object `{success: true,data}`

### `message.replyError( e: RequestError<T> )`
reply the message with json object `{success: false,message: e.message, data:e.data}`

## BusProvider

### initialize()
initialize busProvider and start listen to events if not in in `auto` mode

### `publish(type: string, data: any, expire?: number): Promise<void>`
publish event
- type -  event name
- data - any data
- expire - timeout until the message is expired in the queue

### `request<T>(type: string, data: any, expire?: number): Promise<T>`
request data by event return promise with event response
- type -  event name
- data - any data
- expire - timeout until the request is rejected

### `close<T>(): Promise<void>`
close the connection and clean all handlers

### `getQueueMessagesCount(): Promise<number>`
return number of pending events in the queue