import Subscriber from "./Subscriber";

export default class SubscriberCollection {
    private readonly subscribers: Subscriber[] = [];

    add(s: Subscriber) {
        this.subscribers.push(s);
    }

    destroy(key: symbol): boolean {
        for (const s of this.subscribers) {
            if (s.hasSubscriptionKey(key)) {
                s.destroy(key);

                return true;
            }
        }

        throw new Error('Error in EventStore. Subscription symbol does not exist');
    }
}