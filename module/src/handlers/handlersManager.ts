import {define, Define, IApp, initMethod, inject, singleton, Util} from 'appolo'
import { HandlerSymbol} from "../common/decorators";
import * as _ from "lodash";
import {BaseHandlersManager} from "./baseHandlersManager";

@define()
@singleton()
export class HandlersManager extends BaseHandlersManager{

    protected readonly Symbol = HandlerSymbol;

}