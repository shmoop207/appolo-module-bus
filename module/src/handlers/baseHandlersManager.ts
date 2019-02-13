import {Define, IApp, initMethod, inject, singleton, Util} from 'appolo'
import * as _ from "lodash";
import {IHandler, IHandlerMetadata} from "../common/interfaces";


@singleton()
export abstract class BaseHandlersManager {

    @inject() private app: IApp;

    private _handlers = new Map<string, IHandler[]>();

    protected abstract readonly Symbol: Symbol;
    protected  readonly Uniq: boolean = false;

    @initMethod()
    protected initialize() {

        let exported = Util.findAllReflectData<IHandlerMetadata>(this.Symbol, this.app.parent.exported);

        _.forEach(exported, (item) => this._createHandler(item.fn, item.define, item.metaData))
    }

    private _createHandler(fn: Function, define: Define, metaData: IHandlerMetadata) {


        _.forEach(metaData, handler => {

            _.forEach(handler.eventNames, eventName => {

                if(this.Uniq && this._handlers.has(eventName)){
                    throw new Error(`replay event handler must be uniq for ${eventName}`)
                }

                if (!this._handlers.has(eventName)) {
                    this._handlers.set(eventName, []);
                }

                this._handlers.get(eventName).push({define, propertyKey: handler.propertyKey});
            })
        });
    }

    public get keys(): string[] {
        return Array.from(this._handlers.keys())
    }

    public getHandlers(key: string): IHandler[] {
        return this._handlers.get(key) || []
    }

}