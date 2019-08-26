import {module, Module, Util} from 'appolo';
import {IOptions} from "./src/common/IOptions";

import {BusProvider} from "./src/bus/busProvider";
import {Defaults} from "./src/common/defaults";
import {IPublisherMetadata, PublisherMeta} from "./src/common/interfaces";
import {PublisherSymbol, RequestSymbol} from "./src/common/decorators";
import {ILogger} from '@appolo/logger';
import * as _ from 'lodash';

@module()
export class BusModule extends Module<IOptions> {

    constructor(options: IOptions) {
        super(options)
    }

    public get defaults(): Partial<IOptions> {
        return Defaults
    }

    public get exports() {
        return [{id: this.moduleOptions.id, type: BusProvider}];
    }

    public beforeInitialize() {

        let publisherMeta = Util.findAllReflectData<IPublisherMetadata>(PublisherSymbol, this.app.parent.exported);
        let requestMeta = Util.findAllReflectData<IPublisherMetadata>(RequestSymbol, this.app.parent.exported);

        _.forEach(publisherMeta, (item => this._createPublishers(item)));
        _.forEach(requestMeta, (item => this._createRequests(item)));

    }

    private _createPublishers(item: { fn: Function, metaData: IPublisherMetadata }) {

        _.forEach(item.metaData, publisher => this._createPublisher(item.fn, publisher));
    }

    private _createRequests(item: { fn: Function, metaData: IPublisherMetadata }) {

        _.forEach(item.metaData, publisher => this._createRequest(item.fn, publisher));
    }

    private async _createPublisher(fn: Function, item: PublisherMeta) {
        let old = fn.prototype[item.propertyKey];

        let $self = this;

        fn.prototype[item.propertyKey] = async function (): Promise<any> {

            try {
                let result = await old.apply(this, arguments);

                let provider = $self.app.injector.get<BusProvider>(BusProvider);

                await provider.publish(item.eventName, result, item.expire);

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

                let result = await provider.request(item.eventName, data, item.expire);

                return result

            } catch (e) {
                let logger = $self.app.injector.get<ILogger>("logger");

                logger.error(`failed to request ${item.eventName}`, {e});

                throw e;
            }

        }
    }
}
