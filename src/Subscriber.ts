import {InternalSubscriberMap, ISubscriberFn} from "./contracts";

export default class Subscriber {
    private map: InternalSubscriberMap = {};
    private empty: boolean = true;

    private buffer: any[] = [];

    subscribe(fn: ISubscriberFn<any>): symbol {
        const key: symbol = Symbol();
        this.map[key] = fn;
        this.empty = false;

        this.emptyBuffer(this.mapToArray());

        return key;
    }

    publish(data: any = undefined): void {
        if (this.empty) {
            this.buffer.push(data);

            return;
        }

        const fns: ISubscriberFn<any>[] = this.mapToArray();

        this.emptyBuffer(fns);

        this.doPublish(fns, data);
    }

    hasSubscriptionKey(key: symbol): boolean {
        return !!this.map[key];
    }

    destroy(key: symbol): void {
        delete this.map[key];

        if (this.mapToArray().length === 0) {
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

    private mapToArray(): ISubscriberFn<any>[] {
        return Object.getOwnPropertySymbols(this.map).map((s: symbol) => this.map[s]);
    }
}