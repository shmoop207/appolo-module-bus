import {module, Module, IModuleParams} from '@appolo/engine';
import {IOptions} from "./src/common/IOptions";

import {BusProvider} from "./src/bus/busProvider";
import {Defaults} from "./src/common/defaults";
import {IPublisherMetadata, PublisherMeta} from "./src/common/interfaces";
import {PublisherSymbol, RequestSymbol} from "./src/common/decorators";
import {ILogger} from '@appolo/logger';
import {Reflector} from '@appolo/utils';

@module()
export class BusModule extends Module<IOptions> {


    public static for(options?: IOptions): IModuleParams {
        return {type: BusModule, options};
    }

    public get defaults(): Partial<IOptions> {
        return Defaults
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: BusProvider}];
    }

    public beforeModuleInitialize() {

        let publisherMeta = this.app.tree.parent.discovery.findAllReflectData<IPublisherMetadata>(PublisherSymbol);
        let requestMeta = this.app.tree.parent.discovery.findAllReflectData<IPublisherMetadata>(RequestSymbol);

        (publisherMeta || []).forEach(item => this._createPublishers(item));
        (requestMeta || []).forEach(item => this._createRequests(item));

    }

    private _createPublishers(item: { fn: Function, metaData: IPublisherMetadata }) {

        Object.keys(item.metaData || {}).forEach(key => this._createPublisher(item.fn, item.metaData[key]));
    }

    private _createRequests(item: { fn: Function, metaData: IPublisherMetadata }) {

        Object.keys(item.metaData || {}).forEach(key => this._createRequest(item.fn, item.metaData[key]));
    }

    private async _createPublisher(fn: Function, item: PublisherMeta) {
        let old = fn.prototype[item.propertyKey];

        let $self = this;

        fn.prototype[item.propertyKey] = async function (): Promise<any> {

            try {
                let result = await old.apply(this, arguments);

                let provider = $self.app.injector.get<BusProvider>(BusProvider);

                await provider.publish({type: item.eventName, data: result, ...item.options});

                return result

            } catch (e) {
                let logger = $self.app.injector.get<ILogger>("logger");

                logger.error(`failed to publish ${item.eventName}`, {e});

                throw e;
            }

        }
    }

    private async _createRequest(fn: Function, item: PublisherMeta) {
        let old = fn.prototype[item.propertyKey];

        let $self = this;

        fn.prototype[item.propertyKey] = async function (): Promise<any> {

            try {
                let data = await old.apply(this, arguments);

                let provider = $self.app.injector.get<BusProvider>(BusProvider);

                let result = await provider.request({type: item.eventName, data, ...item.options});

                return result

            } catch (e) {
                let logger = $self.app.injector.get<ILogger>("logger");

                logger.error(`failed to request ${item.eventName}`, {e});

                throw e;
            }

        }
    }
}
