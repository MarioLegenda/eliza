import {
    IInternalEvent,
    IInternalEventMap
} from "../contracts";
import Subscriber from "../Subscriber";

export default class EventsHandler {
    private events: IInternalEventMap<any> = {};

    hasEvent(name: string): boolean {
        return !!this.events[name];
    }

    addEvent(name: string): void {
        const evn: IInternalEvent = {
            name: name,
            subscriber: new Subscriber(),
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