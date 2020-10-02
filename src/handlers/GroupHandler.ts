import {
    IInternalGroup,
    InternalGroupMap
} from "../contracts";
import Subscriber from "../Subscriber";
import SubscriberCollection from "../SubscriberCollection";
import SubscriptionMap from "../SubscriptionMap";

export default class GroupHandler {
    private readonly groups: InternalGroupMap = {};

    constructor(private readonly subscriptionCollection: SubscriberCollection) {}

    public addGroup(name: string, events: string[]) {
        const s: Subscriber = new Subscriber(new SubscriptionMap());

        this.subscriptionCollection.add(s);

        this.groups[name] = {
            name: name,
            events: events,
            subscriber: s,
            onceAlreadySent: false,
            onceSubscriptionBuffer: null,
        };
    }

    public groupExists(name: string): boolean {
        return !!this.groups[name];
    }

    public eventHasGroup(name: string): boolean {
        const groupNames: string[] = Object.keys(this.groups);

        for (const groupName of groupNames) {
            if (this.groups[groupName].events.includes(name)) return true;
        }

        return false;
    }

    public getGroupsFromEvent(name: string): string[] {
        const groups: string[] = Object.values(this.groups).filter((g: IInternalGroup) => {
            return g.events.includes(name);
        }).map(g => g.name);

        if (!groups) return [];

        return groups;
    }

    public getGroup(name: string): IInternalGroup {
        if (!this.groupExists(name)) throw new Error(`Error in Eliza. Group with name '${name}' does not exist`);

        return this.groups[name];
    }
}