const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const eliza = require('../dist/eliza.cjs');

describe('Failing events', function() {
    it('should not allow registering the same event more than once', (done) => {
        const name = 'event';
        const eventStore = eliza.New();
        eventStore.register(name);

        try {
            eventStore.register(name);
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Event with name '${name}' already exists`)
            done();
        }
    });

    it('should fail to publish an event that does not exist', (done) => {
        const eventName = 'notExists';
        const eventStore = eliza.New();

        try {
            eventStore.publish(eventName, {});
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Event with name '${eventName}' does not exist`)
            done();
        }
    });

    it('should fail to publishRemove an event that does not exist', (done) => {
        const eventName = 'notExists';
        const eventStore = eliza.New();

        try {
            eventStore.publishRemove(eventName, {});
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Event with name '${eventName}' does not exist`)
            done();
        }
    });

    it('should fail to subscribe to an event that does not exist', (done) => {
        const eventName = 'notExists';
        const eventStore = eliza.New();

        try {
            eventStore.subscribe(eventName, () => {});
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Event or group with name '${eventName}' do not exist`)
            done();
        }
    });

    it('should throw an error if a subscription to destroy does not exist', () => {
        const eventName = 'event';
        const eventValue = 'eventValue';
        let errorEntered = false;

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.publish(eventName, eventValue);

        try {
            eventStore.destroy(Symbol());
        } catch (e) {
            errorEntered = true;
        }

        expect(errorEntered).to.be.equal(true);
    });

    it('should fail if publish is both stream and once', () => {
        const eventName = 'event';
        const eventValue = 'eventValue';
        let errorEntered = false;

        const eventStore = eliza.New();
        eventStore.register(eventName);

        try {
            eventStore.publish(eventName, eventValue, {stream: true, once: true});
        } catch (e) {
            errorEntered = true;
        }

        expect(errorEntered).to.be.true;
    });
});
