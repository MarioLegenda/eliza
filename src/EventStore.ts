import {ReplaySubject, Subscription} from "rxjs";
import deepcopy from "ts-deepcopy";
import IDatabase from "./IDatabase";
import GroupHandler, {IInternalGroup} from "./handlers/GroupHandler";
import EventsHandler from "./handlers/EventsHandler";

interface IEventsToRemove {
    [name: string]: string,
}

interface IInternalEvent<T> {
    name: string,
    subject: ReplaySubject<T> | null,
    database?: IDatabase,
}

interface IInternalEventMap<T> {
    [name: string]: IInternalEvent<T>;
}

interface InternalDatabaseMap {
    [name: string]: IDatabase[]
}

export interface IEventStore {
    register(name: string, databases?: IDatabase[]): void;
    subscribe<T>(name: string, fn: ISubscriberFn<T>, filter?: number): void;
    publish<T>(name: string, data: T): void;
    publishRemove<T>(name: string, data: T, eventsToRemove: IEventsToRemove): void;
    destroy(name: string): void;
    snapshot(name: string): IDatabase[];
    group(name: string, events: string[], databases?: IDatabase[]): void;
}

export interface ISubscriber {
    [name: string]: Subscription | null
}

export interface ISubscriberFn<T> {
    (arg: T): void;
}

export default class EventStore implements IEventStore {
    private readonly subscriptions: ISubscriber = {};
    private readonly databases: InternalDatabaseMap = {};

    private readonly eventHandler: EventsHandler = new EventsHandler();
    private readonly groupHandler: GroupHandler = new GroupHandler();

    public static readonly COMPLETE_DATA = 2;

    register(name: string, databases?: IDatabase[]): void {
        if (this.eventHandler.hasEvent(name)) throw new Error(`Error in EventStore. Event with name '${name}' already exists`);

        if (this.groupHandler.groupExists(name)) throw new Error(`Error in EventStore. Event with name '${name}' already exists as a group`);

        this.doCreateEvent(name, databases);
    }

    subscribe<T>(name: string, fn: ISubscriberFn<T>, filter?: number): void {
        if (!this.eventHandler.hasEvent(name) && !this.groupHandler.groupExists(name)) throw new Error(`Error in EventStore. Event or group with name '${name}' do not exist`);

        if (this.eventHandler.hasEvent(name)) {
            this.doEventSubscription<T>(name, fn, filter);
        }

        if (this.groupHandler.groupExists(name)) {
            this.doGroupSubscription<T>(name, fn);
        }
    }

    publish<T>(name: string, data: T): void {
        if (!this.eventHandler.hasEvent(name)) throw new Error(`Error in EventStore. Event with name '${name}' does not exist`);

        if (this.eventHandler.hasEvent(name)) {
            this.doPublishEvent<T>(name, data);
        }

        if (this.groupHandler.eventHasGroup(name)) {
            const groups: string[] = this.groupHandler.getGroupsFromEvent(name);

            for (const groupName of groups) {
                this.doPublishGroup<T>(groupName, data);
            }
        }
    }

    publishRemove<T>(name: string, data: T, eventsToRemove: IEventsToRemove) {
        const events: string[] = Object.keys(eventsToRemove);

        for (const event of events) {
            const databases: IDatabase[] = this.getDatabase(event);
            const discriminatorField: string = eventsToRemove[event];

            for (const db of databases) {
                db.remove(eventsToRemove[event], data[discriminatorField]);
            }
        }

        this.publish<T>(name, data);
    }

    destroy(name: string): void {
        if (!this.subscriptions[name]) {
            throw new Error(`Cannot destroy a subscription with name '${name}'. Subscription does not exist`);
        }

        (this.subscriptions[name] as Subscription).unsubscribe();
    }

    snapshot(name: string): IDatabase[] {
        return this.getDatabase(name);
    }

    group(name: string, events: string[], databases?: IDatabase[]): void {
        if (this.groupHandler.groupExists(name)) throw new Error(`Error in EventStore. Group with name '${name}' already exists`);
        if (this.eventHandler.hasEvent(name)) throw new Error(`Error in EventStore. Group with name '${name}' already exists as an event`);

        this.groupHandler.addGroup(name, events);

        this.addDatabases(databases);
    }

    private hasDatabase(name: string): boolean {
        return !!this.databases[name];
    }

    private getDatabase(name: string): IDatabase[] {
        if (!this.hasDatabase(name)) throw new Error(`Error in EventStore. Database with name '${name}' does not exist. Did you forget to add the second argument to EventStore::register(name: string, withDatabase?: number)?`);

        return this.databases[name];
    }

    private doCreateEvent(name: string, databases?: IDatabase[]): void {
        this.eventHandler.addEvent(name);

        this.addDatabases(databases);
    }

    private doPublishEvent<T>(name: string, data: T): void {
        const event: IInternalEvent<T> = this.eventHandler.getPublishableEvent<T>(name);

        const copy = deepcopy<T>(data);
        event.subject.next(copy);

        if (this.hasDatabase(name)) {
            const databases: IDatabase[] = this.getDatabase(name);

            for (const db of databases) {
                db.put<T>(name, data);
            }
        }
    }

    private doPublishGroup<T>(name: string, data: T): void {
        const group: IInternalGroup<T> = this.groupHandler.getGroup(name);

        if (!group.subject) {
            group.subject = new ReplaySubject<T>();
        }

        const copy = deepcopy<T>(data);
        group.subject.next(copy);

        if (this.hasDatabase(name)) {
            const databases: IDatabase[] = this.getDatabase(name);

            for (const db of databases) {
                db.put<T>(name, data, group.name);
            }
        }
    }

    private doEventSubscription<T>(name: string, fn: ISubscriberFn<T>, filter?: number): void {
        const event: IInternalEvent<T> = this.eventHandler.getPublishableEvent<T>(name);

        if (filter === EventStore.COMPLETE_DATA) {
            this.subscriptions[name] = (event.subject as ReplaySubject<T>).subscribe(() => {
                const entries = this.getDatabase(name)

                fn.call(null, entries as any);
            });

            return;
        }

        this.subscriptions[name] = (event.subject as ReplaySubject<T>).subscribe(fn);
    }

    private doGroupSubscription<T>(name: string, fn: ISubscriberFn<T>) {
        const group: IInternalGroup<T> = this.groupHandler.getGroup<T>(name);

        if (!group.subject) {
            group.subject = new ReplaySubject<T>();
        }

        this.subscriptions[name] = (group.subject as ReplaySubject<T>).subscribe(fn);
    }

    private addDatabases(databases?: IDatabase[]): void {
        if (databases) {
            if (!this.databases[name]) {
                this.databases[name] = [];
            }

            for (const db of databases) {
                this.databases[name].push(db);
            }
        }
    }
}