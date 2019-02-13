import {define, singleton} from 'appolo'
import {ReplySymbol} from "../common/decorators";
import {BaseHandlersManager} from "./baseHandlersManager";

@define()
@singleton()
export class RepliesManager extends BaseHandlersManager {

    protected readonly Symbol = ReplySymbol;
    protected readonly Uniq: boolean = true;

}