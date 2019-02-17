import {define, singleton} from 'appolo'
import {publisher, request, params,Publisher} from "../../index";

@define()
@singleton()
export class MessagePublisher extends Publisher{

    @publisher("Module.Test")
    async publishMethod(test: string): Promise<void> {

        return params({test})
    }

    @request("Request.Module.Test")
    async requestMethod(test: string): Promise<{ result: string }> {

        return params({test})
    }
}