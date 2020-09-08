module.exports = class GroupStore {
    constructor() {
        this.store = {};
    }

    put(eventName, value, groupName) {
        if (!this.store[eventName]) this.store[eventName] = [];

        this.store[eventName].push(value);
    }

    remove(eventName, value, groupName) {
        delete this.store[eventName];
    }

    get() {
        return this.store;
    }
}