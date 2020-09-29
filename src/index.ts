import EventStore from "./EventStore";
import StoreHandler from "./handlers/StoreHandler";
import EventsHandler from "./handlers/EventsHandler";
import GroupHandler from "./handlers/GroupHandler";
import SubscriberCollection from "./SubscriberCollection";
import {IEventStore} from "./contracts";

export default class Eliza {
    static New(): IEventStore {
        const subscriptionCollection = new SubscriberCollection();

        return new EventStore(
            new StoreHandler(),
            new EventsHandler(subscriptionCollection),
            new GroupHandler(subscriptionCollection),
            subscriptionCollection
        );
    }
}