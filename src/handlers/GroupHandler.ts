import {ReplaySubject} from "rxjs";

export interface InternalGroupMap<T> {
    [name: string]: IInternalGroup<T>;
}

export interface IInternalGroup<T> {
    name: string,
    events: string[],
    subject: ReplaySubject<T> | null,
}

export default class GroupHandler {
    private readonly groups: InternalGroupMap<any> = {};

    public addGroup(name: string, events: string[]) {
        this.groups[name] = {
            name: name,
            events: events,
            subject: null,
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
        const groups: string[] = Object.values(this.groups).filter((g: IInternalGroup<any>) => {
            return g.events.includes(name);
        }).map(g => g.name);

        if (!groups) return [];

        return groups;
    }

    public getGroup<T>(name: string): IInternalGroup<T> {
        if (!this.groupExists(name)) throw new Error(`Error in EventStore. Group with name '${name}' does not exist`);

        return this.groups[name];
    }
}