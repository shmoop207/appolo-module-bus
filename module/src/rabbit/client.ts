import {define, factory, IEnv, IFactory, inject, singleton} from 'appolo'
import {IOptions} from "../common/IOptions";
import {ILogger} from '@appolo/logger';
import {TopologyManager} from "../topology/topologyManager";
import {createRabbit, IOptions as RabbitOptions, Rabbit} from "appolo-rabbit";

@define()
@singleton()
@factory()
export class Client implements IFactory<Rabbit> {


    @inject() private moduleOptions: IOptions;
    @inject() private env: IEnv;
    @inject() private logger: ILogger;
    @inject() private topologyManager: TopologyManager;


    public async get(): Promise<Rabbit> {

        let config = this.topologyManager.buildTopology();


        let rabbit = await createRabbit(config);

        this._bindEvents(rabbit);

        await rabbit.connect();

        return rabbit;
    }


    private _bindEvents(rabbit:Rabbit) {
        process.on('exit', function (err) {
            rabbit.close();
        });

        rabbit.on('closed', (err) => {
            this.logger.error("connection to rabbit unreachable", {err: err});
            (this.topologyManager.envName != "testing") && process.exit(1);
        });

        rabbit.on('failed', (err) => {
            this.logger.error("connection to rabbit failed", {err: err});
            (this.topologyManager.envName != "testing") && process.exit(1);
        });


        rabbit.onUnhandled(function (message) {
            message.ack();
        });
    }
}
