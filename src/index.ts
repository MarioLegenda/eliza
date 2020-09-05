import EventStore from "./EventStore";

export default class Eliza {
    static New(): EventStore {
        return new EventStore();
    }
}