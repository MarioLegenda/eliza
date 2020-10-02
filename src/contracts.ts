import Subscriber from "./Subscriber";

export interface IEventStore {
    register(name: string, stores?: IStore[]): void;
    subscribe<T>(name: string, fn: ISubscriberFn<T>): symbol;
    once<T>(name: string, fn: ISubscriberFn<T>): void;
    publish<T>(name: string, data: T, metadata?: IPublishMetadata): void;
    publishRemove<T>(name: string, data: T, eventsToRemove: string[]): void;
    snapshot(name: string): IStore[];
    group(name: string, events: string[], stores?: IStore[]): void;
    destroy(key: symbol): void;
}

export interface IStore {
    put<T>(eventName: string, value: T, groupName?: string): void;
    remove(eventName: string, value: any, groupName?: string[]): boolean;
    get(): any;
}

export interface IInternalEventMap {
    [name: string]: IInternalEvent;
}

export interface InternalStoreMap {
    [name: string]: IStore[]
}

export interface InternalGroupMap {
    [name: string]: IInternalGroup;
}

export interface IInternalGroup {
    name: string,
    events: string[],
    subscriber: Subscriber,
    onceAlreadySent: boolean,
    onceSubscriptionBuffer: any,
}

export interface IInternalEvent {
    name: string,
    subscriber: Subscriber,
    onceSubscriptionBuffer: any,
    onceAlreadySent: boolean,
    store?: IStore,
}

export interface InternalSubscriberMap {
    //@ts-ignore
    [key: Symbol]: ISubscriberFn<any>,
}

export interface IStream {
    streamNum: number,
    streaming: boolean,
    streamsLeft: number,
}

export interface ISubscriptionMetadata {
    isStore: boolean,
    isStream: boolean,
    isOnce: boolean,
}

export interface IPublishMetadata {
    stream: boolean,
    once: boolean,
}

export interface ISubscriberFn<T> {
    (arg: T, metadata: ISubscriptionMetadata): void;
}

export interface IDataBuffer<T> extends Array<T>{
    [idx: number]: any,
}
