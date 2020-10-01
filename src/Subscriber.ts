import {IDataBuffer, ISubscriberFn, ISubscriptionMetadata} from "./contracts";
import SubscriptionMap from "./SubscriptionMap";

export default class Subscriber {
    private empty: boolean = true;

    private buffer: IDataBuffer<any> = [];
    private onceBuffer: IDataBuffer<any> = [];

    constructor(private readonly map: SubscriptionMap) {}

    subscribe<T>(fn: ISubscriberFn<T>): symbol {
        const key: symbol = this.addToMap<T>(fn);

        this.emptyBuffer(this.map.getValues());

        return key;
    }

    onceBuffered<T>(fn: ISubscriberFn<T>) {
        for (const data of this.onceBuffer) {
            this.send<T>(fn, data, {
                isOnce: true,
                isStreaming: false,
                isStore: false,
            });
        }

        this.onceBuffer = [];
    }

    once<T>(fn: ISubscriberFn<T>, data: any, isStore: boolean, isOnce: boolean): void {
        this.send<T>(fn, data, {
            isOnce: isOnce,
            isStreaming: false,
            isStore: isStore,
        });
    }

    publish<T>(data: T): void {
        if (this.empty) {
            this.buffer.push(data);

            return;
        }

        const fns: ISubscriberFn<any>[] = this.map.getValues();

        this.emptyBuffer(fns);

        this.doPublish<T>(fns, data);
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

    private doPublish<T>(fns: ISubscriberFn<T>[], data: any): void {
        for (const fn of fns) {
            this.send<T>(fn, data, {
                isStore: false,
                isStreaming: false,
                isOnce: false,
            });
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

    private addToMap<T>(fn: ISubscriberFn<T>): symbol {
        const key: symbol = Symbol();
        this.map.add(key, fn);

        this.empty = false;

        return key;
    }

    private async send<T>(fn: ISubscriberFn<T>, data: T, metadata: ISubscriptionMetadata) {
        fn(data, {
            isStore: metadata.isStore,
            isStreaming: metadata.isStreaming,
            isOnce: metadata.isOnce,
        });
    }
}