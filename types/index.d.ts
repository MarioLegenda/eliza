declare module "eliza" {
    declare function New(): IEventStore;

    export interface IEventStore {
        register(name: string, stores?: IStore[]): void;
        subscribe<T>(name: string, fn: ISubscriberFn<T>): symbol;
        stream(name: string, streamNum: number): void;
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

    export interface ISubscriberFn<T> {
        (arg: T): void;
    }

    export interface IStream {
        streamNum: number,
        streaming: boolean,
        streamsLeft: number,
    }

    export interface ISubscriptionMetadata {
        isStore: boolean,
        isStream: boolean,
        stream?: IStream,
        isOnce: boolean,
    }

    export interface IPublishMetadata {
        stream: IStream,
        once: boolean,
    }
}