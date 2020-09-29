import {ISubscriberFn} from "./contracts";
import SubscriptionMap from "./SubscriptionMap";

export default class Subscriber {
    private empty: boolean = true;

    private buffer: any[] = [];

    constructor(private readonly map: SubscriptionMap) {}

    subscribe(fn: ISubscriberFn<any>): symbol {
        const key: symbol = Symbol();
        this.map.add(key, fn);

        this.empty = false;

        this.emptyBuffer(this.map.getValues());

        return key;
    }

    publish(data: any = undefined): void {
        if (this.empty) {
            this.buffer.push(data);

            return;
        }

        const fns: ISubscriberFn<any>[] = this.map.getValues();

        this.emptyBuffer(fns);

        this.doPublish(fns, data);
    }

    hasSubscriptionKey(key: symbol): boolean {
        return this.map.has(key);
    }

    destroy(key: symbol): void {
        this.map.remove(key);

        if (this.map.getValues().length === 0) {
            this.empty = true;
        }
    }

    private isBufferEmpty(): boolean {
        return this.buffer.length === 0;
    }

    private doPublish(fns: ISubscriberFn<any>[], data: any): void {
        for (const fn of fns) {
            fn(data);
        }
    }

    private emptyBuffer(fns: ISubscriberFn<any>[]): void {
        const bufferSnapshot = [...this.buffer];

        if (!this.isBufferEmpty()) {
            for (let i = 0; i < bufferSnapshot.length; i++) {
                this.doPublish(fns, bufferSnapshot[i]);
                this.buffer.splice(i, 1);
            }
        }
    }
}