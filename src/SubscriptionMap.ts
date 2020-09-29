import {InternalSubscriberMap, ISubscriberFn} from "./contracts";

export default class SubscriptionMap {
    private map: InternalSubscriberMap = {};

    add(key: symbol, fn: ISubscriberFn<any>) {
        this.map[key] = fn;
    }

    has(key: symbol): boolean {
        return !!this.map[key];
    }

    getValues(): ISubscriberFn<any>[] {
        return Object.getOwnPropertySymbols(this.map).map((s: symbol) => this.map[s]);
    }

    remove(key: symbol) {
        if (!this.has(key)) throw new Error('Error in EventStore. Subscription symbol does not exist');

        delete this.map[key];
    }
}