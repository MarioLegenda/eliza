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
        const s: Subscriber = new Subscriber(new SubscriptionMap());

        this.subscriptionCollection.add(s);

        const evn: IInternalEvent = {
            name: name,
            subscriber: s,
            onceSubscriptionBuffer: [],
        }

        this.events[name] = evn;
    }

    getEvent(name: string): IInternalEvent {
        if (!this.hasEvent(name)) throw new Error(`Error in Eliza. Event with name '${name}' does not exist`);

        return this.events[name];
    }
}