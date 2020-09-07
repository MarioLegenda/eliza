const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const eliza = require('../dist/eliza.cjs');
const ObjectStore = require('./ObjectStore');

describe("Store tests", () => {
    it('should register a single store for an event', () => {
        const eventStore = eliza.New();
        eventStore.register('event', [
            new ObjectStore()
        ]);

        expect(eventStore.snapshot('event')).to.be.a('array');
        expect(eventStore.snapshot('event').length).to.be.equal(1);
        expect(eventStore.snapshot('event')[0]).to.a('object');
    });

    it('should register multiple stores for an event', () => {
        const eventStore = eliza.New();
        eventStore.register('event', [
            new ObjectStore(),
            new ObjectStore(),
            new ObjectStore(),
        ]);

        expect(eventStore.snapshot('event')).to.be.a('array');
        expect(eventStore.snapshot('event').length).to.be.equal(3);
        expect(eventStore.snapshot('event')[0]).to.a('object');
        expect(eventStore.snapshot('event')[1]).to.a('object');
        expect(eventStore.snapshot('event')[2]).to.a('object');
    });

    it('should put a value in store on publish and store it on subscribe', (done) => {
        const eventStore = eliza.New();
        eventStore.register('event', [
            new ObjectStore()
        ]);

        eventStore.publish('event', {name: 'someName'});

        eventStore.subscribe('event', (value) => {
            expect(value).to.be.a('object');
            expect(value.name).to.be.equal('someName');

            const snapshot = eventStore.snapshot('event');

            expect(snapshot).to.be.a('array');
            expect(snapshot.length).to.be.equal(1);

            expect(snapshot[0].get().event).to.be.a('object');
            expect(snapshot[0].get().event.name).to.be.equal('someName');

            done();
        });
    });

    it('should remove a value from store on publishRemove', (done) => {
        const eventStore = eliza.New();
        eventStore.register('event', [
            new ObjectStore()
        ]);

        const calls = {
            calledOnPublish: false,
        }

        eventStore.publish('event', {name: 'someName'});

        eventStore.subscribe('event', (value) => {
            const snapshot = eventStore.snapshot('event');

            if (!calls.calledOnPublish) {
                expect(snapshot[0].get().event).to.be.a('object');
                expect(snapshot[0].get().event.name).to.be.equal('someName');

                calls.calledOnPublish = true;

                // must be called inside subscribe() to avoid race conditions
                eventStore.publishRemove('event', {}, ['event']);

                return;
            }

            if (calls.calledOnPublish) {
                expect(Object.keys(value).length).to.be.equal(0);
                expect(Object.keys(snapshot[0].get()).length).to.be.equal(0);

                done();
            }
        });
    });

    it('should remove multiple events on publishRemove', (done) => {
        const eventStore = eliza.New();
        const events = ['event1', 'event2', 'event3'];
        
        for (const event of events) {
            eventStore.register(event, [
                new ObjectStore()
            ]);

            // simulate publish
            eventStore.snapshot(event)[0].put(event, {name: 'someName'});
        }

        eventStore.subscribe('event1', (value) => {
            expect(value.name).to.be.equal('nonImportantValue');

            expect(Object.keys(eventStore.snapshot('event1')[0].get()).length).to.be.equal(0);
            expect(Object.keys(eventStore.snapshot('event2')[0].get()).length).to.be.equal(0);
            expect(Object.keys(eventStore.snapshot('event3')[0].get()).length).to.be.equal(0);

            done();
        });

        eventStore.publishRemove('event1', {name: 'nonImportantValue'}, [
            'event1',
            'event2',
            'event3'
        ]);
    });
});