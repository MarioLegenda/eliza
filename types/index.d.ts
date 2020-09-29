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

export interface ISubscriberFn<T> {
    (arg: T): void;
}