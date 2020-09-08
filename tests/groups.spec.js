const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const eliza = require('../dist/eliza.cjs');
const ObjectStore = require('./ObjectStore');
const GroupStore = require('./GroupStore');

describe('Groups', function() {
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

        eventStore.subscribe('group', (value) => {
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
});