import {ReplaySubject} from "rxjs";

export interface IStore {
    put<T>(eventName: string, value: T, groupName?: string): void;
    remove(eventName: string, value: any, groupName?: string): boolean;
    get(): any;
}

export interface IEventsToRemove {
    [name: string]: string,
}

export interface IInternalEvent<T> {
    name: string,
    subject: ReplaySubject<T> | null,
    database?: IStore,
}

export interface IInternalEventMap<T> {
    [name: string]: IInternalEvent<T>;
}

export interface IInternalEvent<T> {
    name: string,
    subject: ReplaySubject<T> | null,
    database?: IStore,
}

export interface IInternalEventMap<T> {
    [name: string]: IInternalEvent<T>;
}

export interface InternalDatabaseMap {
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
