import {define, Define, IApp, initMethod, inject, singleton, Util,lazy} from 'appolo'
import { HandlerSymbol} from "../common/decorators";
import * as _ from "lodash";
import {BaseHandlersManager} from "./baseHandlersManager";
import {TopologyManager} from "../topology/topologyManager";

@define()
@singleton()
export class HandlersManager extends BaseHandlersManager{


}
