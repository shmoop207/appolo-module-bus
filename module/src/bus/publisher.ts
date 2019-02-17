import {inject} from "appolo/index";
import {BusProvider} from "./busProvider";

export class Publisher {

    @inject() protected busProvider: BusProvider;

    public publish(type: string, data: any, expire?: number): Promise<void> {
        return this.busProvider.publish(type, data, expire)
    }

    public request<T>(type: string, data: any, expire?: number): Promise<T> {
        return this.busProvider.request<T>(type, data, expire)
    }
}