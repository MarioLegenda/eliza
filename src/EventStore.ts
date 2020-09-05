import {ReplaySubject, Subscription} from "rxjs";
import deepcopy from "ts-deepcopy";
import GroupHandler from "./handlers/GroupHandler";
import EventsHandler from "./handlers/EventsHandler";
import {
    IStore,
    IEventsToRemove,
    IInternalEvent,
    IInternalGroup,
    InternalStoreMap,
    ISubscriberFn,
    ISubscriber,
    IEventStore
} from "./contracts";
import StoreHandler from "./handlers/StoreHandler";

export default class EventStore implements IEventStore {
    private readonly subscriptions: ISubscriber = {};

    private readonly storeHandler: StoreHandler = new StoreHandler();
    private readonly eventHandler: EventsHandler = new EventsHandler();
    private readonly groupHandler: GroupHandler = new GroupHandler();

    public static readonly COMPLETE_DATA = 2;

    register(name: string, stores?: IStore[]): void {
        if (this.eventHandler.hasEvent(name)) throw new Error(`Error in EventStore. Event with name '${name}' already exists`);

        if (this.groupHandler.groupExists(name)) throw new Error(`Error in EventStore. Event with name '${name}' already exists as a group`);

        this.doCreateEvent(name, stores);
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
            const databases: IStore[] = this.getDatabase(event);
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

    snapshot(name: string): IStore[] {
        return this.storeHandler.getStore(name);
    }

    group(name: string, events: string[], databases?: IStore[]): void {
        if (this.groupHandler.groupExists(name)) throw new Error(`Error in EventStore. Group with name '${name}' already exists`);
        if (this.eventHandler.hasEvent(name)) throw new Error(`Error in EventStore. Group with name '${name}' already exists as an event`);

        this.groupHandler.addGroup(name, events);

        this.storeHandler.addStores(databases);
    }

    private doCreateEvent(name: string, stores?: IStore[]): void {
        this.eventHandler.addEvent(name);

        this.storeHandler.addStores(stores);
    }

    private doPublishEvent<T>(name: string, data: T): void {
        const event: IInternalEvent<T> = this.eventHandler.getPublishableEvent<T>(name);

        const copy = deepcopy<T>(data);
        event.subject.next(copy);

        if (this.storeHandler.hasStore(name)) {
            const databases: IStore[] = this.storeHandler.getStore(name);

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

        if (this.storeHandler.hasStore(name)) {
            const databases: IStore[] = this.storeHandler.getStore(name);

            for (const db of databases) {
                db.put<T>(name, data, group.name);
            }
        }
    }

    private doEventSubscription<T>(name: string, fn: ISubscriberFn<T>, filter?: number): void {
        const event: IInternalEvent<T> = this.eventHandler.getPublishableEvent<T>(name);

        if (filter === EventStore.COMPLETE_DATA) {
            this.subscriptions[name] = (event.subject as ReplaySubject<T>).subscribe(() => {
                const entries = this.storeHandler.getStore(name)

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
}