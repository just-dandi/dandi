import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

import { Uuid } from './uuid';

describe('Uuid', () => {
  beforeEach(() => {});
  afterEach(() => {});

  describe('Uuid.for', () => {
    it('returns a Uuid instance', () => {
      expect(Uuid.for('test')).to.be.instanceOf(Uuid);
    });

    it('returns the same instance when called with the same value multiple times', () => {
      const a = Uuid.for('me');
      const b = Uuid.for('me');
      const c = Uuid.for('me');

      expect(a).to.equal(b);
      expect(b).to.equal(c);
    });
  });

  describe('Uuid.create', () => {
    it('returns a Uuid instance', () => {
      expect(Uuid.create()).to.be.instanceOf(Uuid);
    });

    it('returns unique instances when called with the same value multiple times', () => {
      const a = Uuid.create();
      const b = Uuid.create();
      const c = Uuid.create();

      expect(a).not.to.equal(b);
      expect(b).not.to.equal(c);
      expect(a).not.to.equal(c);
    });
  });

  describe('toString', () => {
    it('returns the string value of the instance', () => {
      const uuid = Uuid.for('me');
      expect(uuid.toString()).to.equal('me');
    });
  });

  describe('valueOf', () => {
    it('returns the string value of the instance', () => {
      const uuid = Uuid.for('me');
      expect(uuid.valueOf()).to.equal('me');
    });
  });
});
