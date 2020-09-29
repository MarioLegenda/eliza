import {
    InternalStoreMap,
    IStore
} from "../contracts";

export default class StoreHandler {
    private readonly stores: InternalStoreMap = {};

    addStores(name: string, stores?: IStore[]) {
        if (stores) {
            if (!this.stores[name]) {
                this.stores[name] = [];
            }

            for (const db of stores) {
                this.stores[name].push(db);
            }
        }
    }

    getStore(name: string): IStore[] {
        if (!this.hasStore(name)) throw new Error(`Error in Eliza. Store with name '${name}' does not exist. Did you forget to add the second argument to EventStore::register(name: string, stores?: IStore)?`);

        return this.stores[name];
    }

    hasStore(name: string): boolean {
        return !!this.stores[name];
    }
}