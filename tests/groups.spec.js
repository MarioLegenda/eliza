const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const eliza = require('../dist/eliza.cjs');
const ObjectStore = require('./ObjectStore');
const GroupStore = require('./GroupStore');

describe('Groups', function() {
    this.timeout(5000);

    it('should react to an event that is in a group', (done) => {
        const eventStore = eliza.New();

        const eventNames = [
            'event1',
            'event2',
            'event3',
        ];

        let numCalled = 0;

        eventStore.register('event1', [
            new ObjectStore(),
        ]);

        eventStore.register('event2', [
            new ObjectStore(),
        ]);

        eventStore.register('event3', [
            new ObjectStore(),
        ]);

        eventStore.group('group', [
            'event1',
            'event2',
            'event3',
        ]);

        eventStore.subscribe('group', (value) => {
            expect(eventNames.includes(value.name));

            numCalled++;

            if (numCalled === 3) {
                done();
            }
        });

        eventStore.publish('event1', {name: 'event1'});
        eventStore.publish('event2', {name: 'event2'});
        eventStore.publish('event3', {name: 'event3'});
    });

    it('should receive the store as the first value for first subscription', () => {
        const eventStore = eliza.New();

        eventStore.register('event', [
            new ObjectStore(),
        ]);

        eventStore.group('group', [
            'event1',
        ], [
            new GroupStore(),
        ]);

        eventStore.subscribe('group', (value, metadata) => {
            expect(metadata.isStore).to.be.true;
        });
    });

    it('should subscribe to a group and put the values into the group store', (done) => {
        const eventStore = eliza.New();

        const eventNames = [
            'event1',
            'event2',
            'event3',
        ];

        let numCalled = 0;

        eventStore.register('event1', [
            new ObjectStore(),
        ]);

        eventStore.register('event2', [
            new ObjectStore(),
        ]);

        eventStore.register('event3', [
            new ObjectStore(),
        ]);

        eventStore.group('group', [
            'event1',
            'event2',
            'event3',
        ], [
            new GroupStore(),
        ]);

        eventStore.subscribe('group', (value, metadata) => {
            if (metadata.isStore) return;

            expect(eventNames.includes(value.name));

            numCalled++;

            if (numCalled === 9) {
                const store = eventStore.snapshot('group')[0].get();

                expect(store['event1'].length).to.be.equal(3);
                expect(store['event2'].length).to.be.equal(3);
                expect(store['event3'].length).to.be.equal(3);

                done();
            }
        });

        eventStore.publish('event1', {name: 'event1'});
        eventStore.publish('event1', {name: 'event1'});
        eventStore.publish('event1', {name: 'event1'});
        eventStore.publish('event2', {name: 'event2'});
        eventStore.publish('event2', {name: 'event2'});
        eventStore.publish('event2', {name: 'event2'});
        eventStore.publish('event3', {name: 'event3'});
        eventStore.publish('event3', {name: 'event3'});
        eventStore.publish('event3', {name: 'event3'});
    });

    it('should publish once event as a group', (done) => {
        const eventStore = eliza.New();

        eventStore.register('event1', [
            new ObjectStore(),
        ]);

        eventStore.register('event2', [
            new ObjectStore(),
        ]);

        eventStore.register('event3', [
            new ObjectStore(),
        ]);

        eventStore.group('group', [
            'event1',
            'event2',
            'event3',
        ], [
            new GroupStore(),
        ]);

        eventStore.once('group', (value, metadata) => {
            expect(metadata.isOnce).to.be.equal(true);

            done();
        });

        eventStore.publish('event1', {name: 'event1'});
    });

    it('should publish once group event and never publish to it again', (done) => {
        const eventStore = eliza.New();

        let calledOnce = false;
        let calledTwice = false;

        eventStore.register('event1', [
            new ObjectStore(),
        ]);

        eventStore.register('event2', [
            new ObjectStore(),
        ]);

        eventStore.register('event3', [
            new ObjectStore(),
        ]);

        eventStore.group('group', [
            'event1',
            'event2',
            'event3',
        ], [
            new GroupStore(),
        ]);

        eventStore.once('group', (value, metadata) => {
            expect(metadata.isOnce).to.be.equal(true);
            calledOnce = true;
        });

        eventStore.publish('event1', {name: 'event1'});

        setTimeout(() => {
            expect(calledOnce).to.be.equal(true);

            eventStore.once('group', () => {
                calledTwice = true;
            });

            eventStore.publish('event1', {name: 'event1'});

            setTimeout(() => {
                expect(calledTwice).to.be.false;
                done();
            }, 1000);
        }, 1000);
    });
});