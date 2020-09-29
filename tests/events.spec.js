const mocha = require('mocha');
const chai = require('chai');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

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

    it('should publish all buffered values to a subscriber', (done) => {
        const eventName = 'event';

        const values = {
            value1: false,
            value2: false,
            value3: false,
        }

        let called = 0;

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.subscribe(eventName, (event) => {
            values[event] = true;
            called++;

            if (event === 'value1') {
                expect(values.value1).to.be.true;
                expect(values.value2).to.be.false;
                expect(values.value3).to.be.false;
            }

            if (event === 'value2') {
                expect(values.value1).to.be.true;
                expect(values.value2).to.be.true;
                expect(values.value3).to.be.false;
            }

            if (called === 3) {
                const v = Object.values(values);

                for (const b of v) {
                    expect(b).to.be.true;
                }

                done();
            }
        });

        eventStore.publish(eventName, 'value1');
        eventStore.publish(eventName, 'value2');
        eventStore.publish(eventName, 'value3');
    });

    it('should publish all buffered values to a all subscribers', (done) => {
        const eventName = 'event';

        const values1 = {
            value1: false,
            value2: false,
            value3: false,
        }

        const values2 = {
            value1: false,
            value2: false,
            value3: false,
        }

        let called1 = 0;
        let called2 = 0;
        let subscribersCalled = 0;

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.subscribe(eventName, (event) => {
            values1[event] = true;
            called1++;

            if (event === 'value1') {
                expect(values1.value1).to.be.true;
                expect(values1.value2).to.be.false;
                expect(values1.value3).to.be.false;
            }

            if (event === 'value2') {
                expect(values1.value1).to.be.true;
                expect(values1.value2).to.be.true;
                expect(values1.value3).to.be.false;
            }

            if (called1 === 3) {
                const v = Object.values(values1);

                for (const b of v) {
                    expect(b).to.be.true;
                }

                if (subscribersCalled === 1) {
                    done();

                    return;
                }

                subscribersCalled++;
            }
        });

        eventStore.subscribe(eventName, (event) => {
            values2[event] = true;
            called2++;

            if (event === 'value1') {
                expect(values2.value1).to.be.true;
                expect(values2.value2).to.be.false;
                expect(values2.value3).to.be.false;
            }

            if (event === 'value2') {
                expect(values2.value1).to.be.true;
                expect(values2.value2).to.be.true;
                expect(values2.value3).to.be.false;
            }

            if (called2 === 3) {
                const v = Object.values(values2);

                for (const b of v) {
                    expect(b).to.be.true;
                }

                if (subscribersCalled === 1) {
                    done();

                    return;
                }

                subscribersCalled++;
            }
        });

        eventStore.publish(eventName, 'value1');
        eventStore.publish(eventName, 'value2');
        eventStore.publish(eventName, 'value3');
    });

    it('should destroy an event subscription without throwing an error', () => {
        const eventName = 'event';
        const eventValue = 'eventValue';

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.publish(eventName, eventValue);

        const key = eventStore.subscribe(eventName, () => {});

        eventStore.destroy(key);
    });
});
