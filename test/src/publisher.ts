import {define, singleton} from 'appolo'
import {publisher, request, response} from "../../index";

@define()
@singleton()
export class MessagePublisher {

    @publisher("Module.Test")
    async publish(test: string): Promise<any> {
        return {test}
    }

    @request("Request.Module.Test")
    async request(test: string): Promise<{ result: string }> {
        return response({test})
    }
}