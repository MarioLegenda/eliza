import {
    IInternalEvent,
    IInternalEventMap
} from "../contracts";
import Subscriber from "../Subscriber";
import SubscriptionMap from "../SubscriptionMap";
import SubscriberCollection from "../SubscriberCollection";

export default class EventsHandler {
    private events: IInternalEventMap<any> = {};

    constructor(private readonly subscriptionCollection: SubscriberCollection) {}

    hasEvent(name: string): boolean {
        return !!this.events[name];
    }

    addEvent(name: string): void {
        const s: Subscriber = new Subscriber();

        this.subscriptionCollection.add(s);

        const evn: IInternalEvent = {
            name: name,
            subscriber: s,
        }

        this.events[name] = evn;
    }

    getEvent<T>(name: string): IInternalEvent {
        if (!this.hasEvent(name)) throw new Error(`Error in EventStore. Event with name '${name}' does not exist`);

        return this.events[name];
    }

    //TODO: delete this function and use getEvent()
    getPublishableEvent<T>(name: string): IInternalEvent {
        return this.getEvent<T>(name);
    }
}