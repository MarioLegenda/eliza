import {InternalSubscriberMap, ISubscriberFn} from "./contracts";

export default class SubscriptionMap {
    private map: InternalSubscriberMap = {};

    private static inst: SubscriptionMap;

    public static instance(): SubscriptionMap {
        if (!SubscriptionMap.inst) SubscriptionMap.inst = new SubscriptionMap();

        return SubscriptionMap.inst;
    }

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
        delete this.map[key];
    }
}