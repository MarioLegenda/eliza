import {ReplaySubject} from "rxjs";
import IDatabase from "./IDatabase";

interface IInternalEvent<T> {
    name: string,
    subject: ReplaySubject<T> | null,
    database?: IDatabase,
}

interface IInternalEventMap<T> {
    [name: string]: IInternalEvent<T>;
}

export default class EventsHandler {
    private events: IInternalEventMap<any> = {};

    public hasEvent(name: string): boolean {
        return !!this.events[name];
    }
}