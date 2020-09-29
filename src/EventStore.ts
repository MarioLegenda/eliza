import deepcopy from "ts-deepcopy";

import {
    IStore,
    IEventsToRemove,
    IInternalEvent,
    IInternalGroup,
    ISubscriberFn,
    IEventStore
} from "./contracts";

import StoreHandler from "./handlers/StoreHandler";
import GroupHandler from "./handlers/GroupHandler";
import EventsHandler from "./handlers/EventsHandler";
import SubscriberCollection from "./SubscriberCollection";

export default class EventStore implements IEventStore {
    constructor(
        private readonly storeHandler: StoreHandler,
        private readonly eventHandler: EventsHandler,
        private readonly groupHandler: GroupHandler,
        private readonly subscriptionCollection: SubscriberCollection,
    ) {}

    register(name: string, stores?: IStore[]): void {
        if (this.eventHandler.hasEvent(name)) throw new Error(`Error in Eliza. Event with name '${name}' already exists`);

        if (this.groupHandler.groupExists(name)) throw new Error(`Error in Eliza. Event with name '${name}' already exists as a group`);

        this.doCreateEvent(name, stores);
    }

    subscribe<T>(name: string, fn: ISubscriberFn<T>): symbol {
        if (!this.eventHandler.hasEvent(name) && !this.groupHandler.groupExists(name)) throw new Error(`Error in Eliza. Event or group with name '${name}' do not exist`);

        if (this.eventHandler.hasEvent(name)) {
            return this.doEventSubscription<T>(name, fn);
        }

        if (this.groupHandler.groupExists(name)) {
            return this.doGroupSubscription<T>(name, fn);
        }
    }

    publish<T>(name: string, data: T): void {
        if (!this.eventHandler.hasEvent(name)) throw new Error(`Error in Eliza. Event with name '${name}' does not exist`);

        if (this.eventHandler.hasEvent(name)) {
            this.doPublishEvent<T>(name, data);
        }

        if (this.groupHandler.eventHasGroup(name)) {
            const groups: string[] = this.groupHandler.getGroupsFromEvent(name);

            for (const groupName of groups) {
                this.doPublishGroup<T>(name, groupName, data);
            }
        }
    }

    publishRemove<T>(name: string, data: T, eventsToRemove: IEventsToRemove) {
        if (!this.eventHandler.hasEvent(name)) throw new Error(`Error in Eliza. Event with name '${name}' does not exist`);

        for (const event of eventsToRemove) {
            const stores: IStore[] = this.storeHandler.getStore(event);

            const groupName = (this.groupHandler.eventHasGroup(name)) ? this.groupHandler.getGroupsFromEvent(name) : [];

            for (const db of stores) {
                db.remove(event, data, groupName);
            }
        }

        if (this.eventHandler.hasEvent(name)) {
            this.doPublishEvent<T>(name, data, true);
        }

        if (this.groupHandler.eventHasGroup(name)) {
            const groups: string[] = this.groupHandler.getGroupsFromEvent(name);

            for (const groupName of groups) {
                this.doPublishGroup<T>(name, groupName, data, true);
            }
        }
    }

    snapshot<T>(name: string): IStore[] {
        return this.storeHandler.getStore<T>(name);
    }

    group(name: string, events: string[], stores?: IStore[]): void {
        if (this.groupHandler.groupExists(name)) throw new Error(`Error in Eliza. Group with name '${name}' already exists`);
        if (this.eventHandler.hasEvent(name)) throw new Error(`Error in Eliza. Group with name '${name}' already exists as an event`);

        this.groupHandler.addGroup(name, events);

        this.storeHandler.addStores(name, stores);
    }

    destroy(key: symbol): void {
        this.subscriptionCollection.destroy(key);
    }

    private doCreateEvent(name: string, stores?: IStore[]): void {
        this.eventHandler.addEvent(name);

        this.storeHandler.addStores(name, stores);
    }

    private doPublishEvent<T>(name: string, data: T, noStore: boolean = false): void {
        const event: IInternalEvent = this.eventHandler.getEvent<T>(name);

        if (!noStore) {
            if (this.storeHandler.hasStore(name)) {
                const stores: IStore[] = this.storeHandler.getStore(name);

                for (const db of stores) {
                    db.put<T>(name, data);
                }
            }
        }

        const copy = deepcopy<T>(data);
        event.subscriber.publish<T>(copy);
    }

    private doPublishGroup<T>(name: string, groupName: string, data: T, noStore: boolean = false): void {
        const group: IInternalGroup = this.groupHandler.getGroup(groupName);

        if (!noStore) {
            // store the value in the event name stores
            if (this.storeHandler.hasStore(name)) {
                const stores: IStore[] = this.storeHandler.getStore(name);

                for (const store of stores) {
                    store.put<T>(name, deepcopy<T>(data), group.name);
                }
            }

            // store the value in the group store
            if (this.storeHandler.hasStore(groupName)) {
                const stores: IStore[] = this.storeHandler.getStore(groupName);

                for (const store of stores) {
                    store.put<T>(name, deepcopy<T>(data), group.name);
                }
            }
        }

        const copy = deepcopy<T>(data);
        group.subscriber.publish<T>(copy);
    }

    private doEventSubscription<T>(name: string, fn: ISubscriberFn<T>): symbol {
        const event: IInternalEvent = this.eventHandler.getEvent<T>(name);

        return event.subscriber.subscribe<T>(fn);
    }

    private doGroupSubscription<T>(
        name: string,
        fn: ISubscriberFn<T>,
    ): symbol {
        const group: IInternalGroup = this.groupHandler.getGroup<T>(name);

        return group.subscriber.subscribe<T>(fn);
    }
}