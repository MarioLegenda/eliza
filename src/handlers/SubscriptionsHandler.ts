import {ISubscriber} from "../contracts";
import {Subscription} from "rxjs";

export default class SubscriptionsHandler {
    private readonly subscriptions: ISubscriber = {};

    hasSubscription(name: string): boolean {
        return !!this.subscriptions[name]
    }

    unsubscribe(name: string): void {
        (this.subscriptions[name] as Subscription).unsubscribe();
    }

    addSubscription(name: string, subscription: Subscription): void {
        this.subscriptions[name] = subscription;
    }

    getSubscription(name: string): Subscription {
        return this.subscriptions[name] as Subscription;
    }
}