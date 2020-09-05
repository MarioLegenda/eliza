import {ReplaySubject} from "rxjs";
import {
    IInternalEvent,
    IInternalEventMap
} from "../contracts";

export default class EventsHandler {
    private events: IInternalEventMap<any> = {};

    hasEvent(name: string): boolean {
        return !!this.events[name];
    }

    addEvent(name: string): void {
        const evn: IInternalEvent<null> = {
            name: name,
            subject: null,
        }

        this.events[name] = evn;
    }

    getEvent<T>(name: string): IInternalEvent<T> {
        if (!this.hasEvent(name)) throw new Error(`Error in EventStore. Event with name '${name}' does not exist`);

        return this.events[name];
    }

    getPublishableEvent<T>(name: string): IInternalEvent<T> {
        const event: IInternalEvent<T> = this.getEvent<T>(name);

        if (!event.subject) {
            event.subject = new ReplaySubject<T>();
        }

        return event;
    }
}