# Eliza - event store for any frontend framework

## Introduction

Eliza is an event store that can be used with any frontend framework. It has only 2 dependencies,
rxjs and ts-deepcopy so its very light. Without further ado, lets go right into the basics.

*Note: All examples below will be written in Typescript in order for you to see what kind of 
class method signatures Eliza works with*

## The basics

#### Creating Eliza event store

````javascript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();
````

A simple call to `Eliza.New()` will create a new event store. That means that 
you can have multiple event stores since a call to `Eliza.New()` always creates
a new event store.

**All of the examples in this documentation do not unsubscribe from created subscriptions
for brevity. Be sure to read the last section Destroying events.**

#### Working with events

Eliza implements the following interface:

````typescript
expot interface IEventStore {
    register(name: string, databases?: IStore[]): void;
    subscribe<T>(name: string, fn: ISubscriberFn<T>, filter?: number): void;
    publish<T>(name: string, data: T): void;
    publishRemove<T>(name: string, data: T, eventsToRemove: IEventsToRemove): void;
    snapshot(name: string): IStore[];
    group(name: string, events: string[], databases?: IStore[]): void;
}
````

We will go trough each an every method in this documentation but first,
lets talk about registering an event.

With Eliza, you have to register an event in order to use it.

````javascript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

eventStore.register('myEvent');
````

Your event is registered and ready to use. Since Eliza uses rxjs, it uses
*publish/subscribe* pattern by default. So, in order to publish and subscribe to 
an event, you use `EventStore::publish` and `EventStore::subscribe` methods.

````javascript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

eventStore.register('myEvent');

eventStore.publish('myEvent', {name: 'Eliza'});

eventStore.subscribe<{name: string}>('myEvent', (data: {name: string}) => {
    // this is where your data would be 
    // after you publish it.
});
````

The order of `EventStore::publish` and `EventStore::subscribe` does not matter.
You could have easily replaced them and the outcome would be the same.

````javascript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

eventStore.register('myEvent');

// Notice that subscribe is now called before
// publish but that does not matter.
eventStore.subscribe<{name: string}>('myEvent', (data: {name: string}) => {
    // this is where your data would be 
    // after you publish it.
});

eventStore.publish('myEvent', {name: 'Eliza'});
````

It is also very important to mention that the value that you receive
in `EventStore::subscribe` is not the same reference that you send in
`EventStore::publish` (if it's a reference type, like a plain object). 

## Stores

Eliza takes a different approach in store management in the sense that it 
does not have one by default. You have to create your own store for each event.
If you wish to combine multiple events, use groups (we will talk about groups later on).

A store implements the following interface:

````typescript
interface IStore {
    put<T>(eventName: string, value: T, groupName?: string): void;
    remove(eventName: string, value: any, groupName?: string[]): boolean;
    get(): any;
}
````

Let's create a simple object store for a single event.

````typescript
class ObjectStore implements IStore {
    constructor() {
        this.store = {};
    }

    put<T>(eventName, value, groupName) {
        this.store[eventName] = value;
    }

    remove(eventName, value, groupName) {
        delete this.store[eventName];
    }

    get() {
        return this.store;
    }
}
````

Pretty straightforward. `ObjectStore::put` puts an item in the store,
`ObjectStore::remove` removes it and `ObjectStore::get` returns the entire
store. 

You will notice that I'm not returning a new reference of the store in 
`Object::get`. It is a good practice to return a copy of the data from the store
but it is up to you. In the example above, I didn't do it for brevity. 

Registering a store for an event goes like this:

````javascript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

eventStore.register('myEvent', [new ObjectStore()]);
````

Notice the second argument to `EventStore::register` and notice that
it's an array. You can register multiple for an event. From our example,
`ObjectStore` is overwriting the previous value. But you can create another store
for this event that could keep, for example last 5 events. It is up to you.

Now, how to values "go" into a store?

`IStore::put` and `IStore::remove` have a special significance in the event store.

Every time you call `EventStore::publish`, if the event has a registered store(s),
`IStore::put` will be called with the `event name`, the data that you published and
and optional group name (we will talk about groups later on). It will be called for
every store that you register. How you handle the `put` method is up to you.

Before we go to `IStore::remove` it is important to say that, if the data that you are
publishing is a reference type, `IStore::put` will get a new reference of the that data 
i.e a copy of the data. 

So, how do we remove something from the event store?

In the beginning of this documentation, I introduced the `IEventStore` interface
that every event store implements. That interface has a method `IEventStore::publishRemove`.
This method has the same functionality as `IEventStore::publish` with a single difference.
It calls `IStore::remove` for every registered store of an event. 

Since it is the same as `IEventStore::publish`, all the subscribers that are subscribed to
an event that is removed will be called but before they are called, `IStore::remove` will be called,
and depending on your implementation, and entry in the store should be removed. 

There is one method on `IEventStore` that we haven't talked about and it is important for when
working with stores. That method is `IEventStore::snapshot`. 

This method simply returns an array of an array of stores that you registered for a certain event.

````typescript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

// ArrayStore and LimitedStore don't actually exist.
// I just putted them here for this example
eventStore.register('myEvent', [
    new ObjectStore(),
    new ArrayStore(),
    new LimitedStore(),
]);

const stores: IStore[] = eventStore.snapshot('myEvent');
````

`EventStore::snapshot` will return an array of stores in the same order that you registered
them. In our example above, `stores[0]` would be an instance of `ObjectStore` and
`stores[1]` would be an instance of `ArrayStore`. These stores are not altered
in any way and they are the same references with which you registered them. But calling
`IStore::get` on any of them returns the data that **you** specify. Keep that in mind
if returned values are reference types and you modify them. If you do that, they will be modified
inside the store too.

An interesting thing about stores is that you can initialize a store before you publish anything
and this is perfectly valid and ok.

````typescript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

// ArrayStore and LimitedStore don't actually exist.
// I just putted them here for this example
eventStore.register('myEvent', [
    new ObjectStore({name: 'Eliza'}),
    new ArrayStore(['initial value 1', 'inital value 2']),
    new LimitedStore(),
]);

const stores: IStore[] = eventStore.snapshot('myEvent');
````

## Groups

Groups are a way of grouping multiple events and subscribing to 
a group when any of these events happen. Groups can also have their own
stores. If that is the case, `IStore::put` and `IStore::remove` will receive
the third argument which will be the group name. Then, you can react based on
the group that the event is in. 

Let's create our first example of a group.

````typescript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

eventStore.register('event1', [
    new ObjectStore(),
]);

eventStore.register('event2');

// GroupStore doesn't actually exist
// but I put it here to be more clear
eventStore.group('groupName', [
    'event1',
    'event2'
], new GroupStore());

eventStore.subscribe('groupName', (value) => {
    // data that you publish for event1 or event2 will
    // be here
});

eventStore.publish('event1', {name: 'event1'});
eventStore.publish('event2', {name: 'event2'});
````

If you run this code, the subscriber for `groupName` will be called
twice, each time for every event. 

It is very important to say that both `ObjectStore::put` and
`GroupStore::put` will be called for `event1`. Depending on how you handle
data published by that event, it will be store in both `ObjectStore` and
`GroupStore`. `IStoreRemove` will also be called on `GroupStore` if you 
called `eventStore.publishRemove('event1', {})`;

## Destroying events

Eliza uses rxjs to publish and subscribe to events. Because of that,
after you subscribe to an event, a rxjs `Subscription` is called. Rxjs subscriptions
are not destroyed automatically. It is your responsibility to destroy (unsubscribe) them. 

After you subscribe, a `Subscription` is returned. It is your responsibility to unsubscribe from that 
subscription.

````typescript
import Eliza from "eliza";

const eventStore: IEventStore = Eliza.New();

eventStore.register('event', [
    new ObjectStore(),
]);

eventStore.publish('event', {});

const subscription: Subscription = eventStore.subscribe('event', () => {

});

subscription.unsubscribe();
````