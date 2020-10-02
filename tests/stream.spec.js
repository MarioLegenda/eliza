const mocha = require('mocha');
const chai = require('chai');
const assert = require('assert');

const it = mocha.it;
const describe = mocha.describe;
const expect = chai.expect;

const eliza = require('../dist/eliza.cjs');
const ObjectStore = require('./ObjectStore');

describe('Streams', function() {
    this.timeout(5000);

    it('should stream a number of events to a event subscriber', (done) => {
        const eventName = 'event';
        const streamNum = 10;

        const eventStore = eliza.New();
        eventStore.register(eventName);

        eventStore.stream('event', streamNum);

        let streamsLeft = streamNum;

        eventStore.subscribe(eventName, (event, metadata) => {
            if (!metadata.stream) {
                expect(metadata.isStream).to.be.false;
                expect(metadata.stream).to.be.undefined;
                done();
            } else {
                expect(metadata.isStream).to.be.true;
                expect(metadata.stream.streaming).to.be.true;
                expect(metadata.stream.streamsLeft).to.be.equal(streamsLeft);
                expect(event).to.be.equal(`eventValue-${Math.abs(streamsLeft - 10)}`);
            }
        });

        for (let i = 0; i < 10; i++) {
            --streamsLeft;

            eventStore.publish(eventName, `eventValue-${i + 1}`);
        }
    });
});