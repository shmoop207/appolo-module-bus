import {App} from '@appolo/engine';

import {LoggerModule} from '@appolo/logger';
import {HttpModule} from '@appolo/http';


export = async function (app: App) {

    if(!app.injector.hasDefinition("logger")){
        await app.module.load(LoggerModule)
    }

    await app.module.use(HttpModule)

}
