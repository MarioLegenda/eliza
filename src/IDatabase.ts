export default interface IDatabase {
    put<T>(eventName: string, value: T, groupName?: string): void;
    remove(eventName: string, value: any, groupName?: string): boolean;
    get(): any;
}
