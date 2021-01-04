import {define, singleton,alias} from '@appolo/inject'
import {handler, IMessage,reply} from "../../index";

@define()
@singleton()
export class MessageHandler  {

    @handler("Module.Test")
    handle(msg: IMessage<any>): void {

    }

    @reply("Request.Module.Test")
    replay(mes:IMessage<any>){
        return {result:mes.body.test +"working"}
    }

    @reply(()=>"Request.Module.Test2")
    replay2(mes:IMessage<any>){
        return {result:mes.body.test +"working"}
    }
}
