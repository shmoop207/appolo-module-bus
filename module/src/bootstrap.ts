import { define, inject, singleton} from '@appolo/inject'
import {BusProvider} from "./bus/busProvider";
import {IOptions} from "./common/IOptions";
import {IBootstrap,bootstrap} from "@appolo/engine";

@define()
@singleton()
@bootstrap()
export class Bootstrap implements IBootstrap {

    @inject() protected busProvider: BusProvider;
    @inject() protected moduleOptions: IOptions;


    public async run(): Promise<void> {
        if (this.moduleOptions.autoListen) {
            await this.busProvider.initialize();
        }
    }

}
