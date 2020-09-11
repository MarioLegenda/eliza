export interface IEventStore {
    register(name: string, databases?: IStore[]): void;
    subscribe<T>(name: string, fn: ISubscriberFn<T>, filter?: number): void;
    publish<T>(name: string, data: T): void;
    publishRemove<T>(name: string, data: T, eventsToRemove: { [name: string]: string }): void;
    snapshot(name: string): IStore[];
    group(name: string, events: string[], databases?: IStore[]): void;
}

export interface IStore {
    put<T>(eventName: string, value: T, groupName?: string): void;
    remove(eventName: string, value: any, groupName?: string[]): boolean;
    get(): any;
}

export interface ISubscriberFn<T> {
    (arg: T): void;
}