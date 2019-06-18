import {App} from 'appolo';

import {LoggerModule} from '@appolo/logger';
import {HttpModule} from '@appolo/http';


export = async function (app: App) {

    if(!app.injector.hasDefinition("logger")){
        await app.module(LoggerModule)
    }

    await app.module(HttpModule)

}
