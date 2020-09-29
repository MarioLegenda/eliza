import Subscriber from "./Subscriber";

export interface IEventStore {
    register(name: string, stores?: IStore[]): void;
    subscribe<T>(name: string, fn: ISubscriberFn<T>): symbol;
    publish<T>(name: string, data: T): void;
    publishRemove<T>(name: string, data: T, eventsToRemove: IEventsToRemove): void;
    snapshot(name: string): IStore[];
    group(name: string, events: string[], stores?: IStore[]): void;
    destroy(key: symbol): void;
}

export interface IStore {
    put<T>(eventName: string, value: T, groupName?: string): void;
    remove(eventName: string, value: any, groupName?: string[]): boolean;
    get(): any;
}

export interface IEventsToRemove {
    [name: string]: string,
}

export interface IInternalEvent {
    name: string,
    subscriber: Subscriber,
    store?: IStore,
}

export interface IInternalEventMap<T> {
    [name: string]: IInternalEvent;
}

export interface IInternalEventMap<T> {
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
}

export interface InternalSubscriberMap {
    [key: Symbol]: ISubscriberFn<any>,
}

export interface ISubscriberFn<T> {
    (arg: T): void;
}

export interface IDataBuffer<T> {
    [idx: number]: any,
    length: number,
    push: (...[]: any) => void,
}
