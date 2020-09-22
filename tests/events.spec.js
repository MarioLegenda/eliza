const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;
const {map} = require('rxjs/operators');

const eliza = require('../dist/eliza.cjs');

describe('Events', function() {
    it('should register an event without error', () => {
        const eventStore = eliza.New();
        eventStore.register('event');
    });

    it('should publish and subscribe to an event', (done) => {
        const eventName = 'event';
        const eventValue = 'eventValue';

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.publish(eventName, eventValue);

        eventStore.subscribe(eventName, (event) => {
            expect(event).to.be.equal(eventValue);
            done();
        });
    });

    it('should publish and subscribe to event no matter the publish()/subscribe() invocation order', (done) => {
        const eventName = 'event';
        const eventValue = 'eventValue';

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.subscribe(eventName, (event) => {
            expect(event).to.be.equal(eventValue);
            done();
        });

        eventStore.publish(eventName, eventValue);
    });

    it('should apply an rxjs operator to a subscription result', (done) => {
        const eventName = 'event';
        const eventValue = 'eventValue';

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.subscribe(eventName, (event) => {
            expect(event).to.be.equal('new value');
            done();
        }, map(() => {
            return 'new value';
        }));

        eventStore.publish(eventName, eventValue);
    });
});
