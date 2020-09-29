import EventStore from "./EventStore";
import StoreHandler from "./handlers/StoreHandler";
import EventsHandler from "./handlers/EventsHandler";
import GroupHandler from "./handlers/GroupHandler";
import SubscriberCollection from "./SubscriberCollection";

export default class Eliza {
    static New(): EventStore {
        const subscriptionCollection = new SubscriberCollection();

        return new EventStore(
            new StoreHandler(),
            new EventsHandler(subscriptionCollection),
            new GroupHandler(subscriptionCollection),
            subscriptionCollection
        );
    }
}