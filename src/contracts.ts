import {ReplaySubject, Subscription} from "rxjs";

export interface IEventStore {
    register(name: string, stores?: IStore[]): void;
    subscribe<T>(name: string, fn: ISubscriberFn<T>, filter?: number): Subscription;
    publish<T>(name: string, data: T): void;
    publishRemove<T>(name: string, data: T, eventsToRemove: IEventsToRemove): void;
    snapshot(name: string): IStore[];
    group(name: string, events: string[], stores?: IStore[]): void;
}

export interface IStore {
    put<T>(eventName: string, value: T, groupName?: string): void;
    remove(eventName: string, value: any, groupName?: string[]): boolean;
    get(): any;
}

export interface IEventsToRemove {
    [name: string]: string,
}

export interface IInternalEvent<T> {
    name: string,
    subject: ReplaySubject<T> | null,
    store?: IStore,
}

export interface IInternalEventMap<T> {
    [name: string]: IInternalEvent<T>;
}

export interface IInternalEvent<T> {
    name: string,
    subject: ReplaySubject<T> | null,
    store?: IStore,
}

export interface IInternalEventMap<T> {
    [name: string]: IInternalEvent<T>;
}

export interface InternalStoreMap {
    [name: string]: IStore[]
}

export interface InternalGroupMap<T> {
    [name: string]: IInternalGroup<T>;
}

export interface IInternalGroup<T> {
    name: string,
    events: string[],
    subject: ReplaySubject<T> | null,
}

export interface ISubscriber {
    [name: string]: Subscription | null
}

export interface ISubscriberFn<T> {
    (arg: T): void;
}
