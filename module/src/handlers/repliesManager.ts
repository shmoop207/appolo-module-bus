import {define, singleton, inject} from 'appolo'
import {ReplySymbol} from "../common/decorators";
import {BaseHandlersManager} from "./baseHandlersManager";
import {TopologyManager} from "../topology/topologyManager";

@define()
@singleton()
export class RepliesManager extends BaseHandlersManager {

    protected readonly Uniq: boolean = true;

}
