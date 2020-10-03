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

    it('should fail to register group if event with same name already exists', (done) => {
        const eventStore = eliza.New();
        eventStore.group('group', ['some event']);

        try {
            eventStore.register('group');
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Event with name 'group' already exists as a group`);
            done();
        }
    });

    it('should fail to publish an event that does not exist', (done) => {
        const eventName = 'notExists';
        const eventStore = eliza.New();

        try {
            eventStore.publish(eventName, {});
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Event or group with name '${eventName}' do not exist`)
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

    it('should fail to subscribe once if event or group does not exist', (done) => {
        const eventName = 'notExists';
        const eventStore = eliza.New();

        try {
            eventStore.once(eventName, () => {});
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Event or group with name '${eventName}' do not exist`);
            done();
        }
    });

    it('should fail to add a group if it already exist', (done) => {
        const eventName = 'group';
        const eventStore = eliza.New();
        eventStore.group(eventName);

        try {
            eventStore.group(eventName);
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Group with name '${eventName}' already exists`);
            done();
        }
    });

    it('should fail to add a group if it exists as an event', (done) => {
        const eventName = 'group';
        const eventStore = eliza.New();
        eventStore.register(eventName);

        try {
            eventStore.group(eventName);
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Group with name '${eventName}' already exists as an event`);
            done();
        }
    });

    it('should fail to get a store if it does not exist', (done) => {
        const eventStore = eliza.New();

        try {
            eventStore.snapshot('notExists');
        } catch (e) {
            expect(e.message).to.be.equal(`Error in Eliza. Store with name 'notExists' does not exist`);
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
            expect(e.message).to.be.equal('Error in Eliza. Subscription symbol does not exist');
        }

        expect(errorEntered).to.be.equal(true);
    });

    it('should fail is event/group to stream does not exist', () => {
        const eventName = 'event';
        let errorEntered = false;

        const eventStore = eliza.New();

        try {
            eventStore.stream(eventName, 10);
        } catch (e) {
            errorEntered = true;
            expect(e.message).to.be.equal(`Error in Eliza. Event or group with name '${eventName}' do not exist`);
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
            expect(e.message).to.be.equal(`Error in Eliza. Cannot publish event ${eventName} as both stream and once`);
        }

        expect(errorEntered).to.be.true;
    });

    it('should fail if event to publish does not exist', () => {
        const eventName = 'event';
        let errorEntered = false;

        const eventStore = eliza.New();
        eventStore.register(eventName);

        try {
            eventStore.publishRemove(eventName, {}, ['notExists']);
        } catch (e) {
            errorEntered = true;
            expect(e.message).to.be.equal(`Error in Eliza. Event or group with name 'notExists' do not exist`);
        }

        expect(errorEntered).to.be.true;
    });
});
