module.exports = class ObjectStore {
    constructor() {
        this.store = {};
    }

    put(eventName, value, groupName) {
        this.store[eventName] = value;
    }

    remove(eventName, value, groupName) {
        delete this.store[eventName];
    }

    get() {
        return this.store;
    }
}