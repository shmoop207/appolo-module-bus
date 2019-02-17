import {define, factory, IEnv, IFactory, inject, singleton} from 'appolo'
import {IOptions} from "../common/IOptions";
import {ILogger} from '@appolo/logger';
import {TopologyManager} from "../topology/topologyManager";
import rabbit = require("rabbot");
import {IClient} from "../common/interfaces";

@define()
@singleton()
@factory()
export class Client implements IFactory<IClient> {


    @inject() private moduleOptions: IOptions;
    @inject() private env: IEnv;
    @inject() private logger: ILogger;
    @inject() private topologyManager: TopologyManager;


    public async get(): Promise<IClient> {

        let config = this.topologyManager.buildTopology();

        this._bindEvents();

        await rabbit.configure(config);

        return rabbit;
    }


    private _bindEvents() {
        process.on('exit', function (err) {
            rabbit.close();
        });

        rabbit.on('unreachable', (err) => {
            this.logger.error("connection to rabbit unreachable", {err: err});
            (this.topologyManager.envName != "testing") && process.exit(1);
        });

        rabbit.on('failed', (err) => {
            this.logger.error("connection to rabbit failed", {err: err});
            (this.topologyManager.envName != "testing") && process.exit(1);
        });

        // rabbit.on('closed', () => {
        //     this.logger.error("connection to rabbit closed");
        // });

        rabbit.onUnhandled(function (message) {
            message.ack();
        });
    }
}