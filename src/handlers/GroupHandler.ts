import {
    IInternalGroup,
    InternalGroupMap
} from "../contracts";
import Subscriber from "../Subscriber";

export default class GroupHandler {
    private readonly groups: InternalGroupMap = {};

    public addGroup(name: string, events: string[]) {
        this.groups[name] = {
            name: name,
            events: events,
            subscriber: new Subscriber(),
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

    public getGroup<T>(name: string): IInternalGroup {
        if (!this.groupExists(name)) throw new Error(`Error in EventStore. Group with name '${name}' does not exist`);

        return this.groups[name];
    }
}