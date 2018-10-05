import { expect } from 'chai';

import { NestedKeyTransformer } from './nested.key.transformer';

describe('NestedKeyTransformer', () => {
  let transformer: NestedKeyTransformer;

  beforeEach(() => {
    transformer = new NestedKeyTransformer();
  });
  afterEach(() => {
    transformer = undefined;
  });

  describe('mapFromDb', () => {
    it('creates a hierarchical object from dot notation keys', () => {
      const dbObj = {
        'foo.a': 'yes',
        'foo.b': 'okay',
        bar: 'hello',
      };
      expect(transformer.transform(dbObj)).to.deep.equal({
        bar: 'hello',
        foo: {
          a: 'yes',
          b: 'okay',
        },
      });
    });

    it('does not create child objects for nested structures with all null values', () => {
      const dbObj = {
        'foo.a': null,
        'foo.b': null,
        bar: 'hello',
      };
      expect(transformer.transform(dbObj)).to.deep.equal({
        bar: 'hello',
      });
    });

    it('creates child objects for nested structures with some null values', () => {
      const dbObj = {
        'foo.a': null,
        'foo.b': 'yes',
        bar: 'hello',
      };
      expect(transformer.transform(dbObj)).to.deep.equal({
        bar: 'hello',
        foo: {
          a: null,
          b: 'yes',
        },
      });
    });

    it('creates child objects for nested structures with some null values and a nested value', () => {
      const dbObj = {
        'foo.a': null,
        'foo.b.okay': 'yes',
        bar: 'hello',
      };
      expect(transformer.transform(dbObj)).to.deep.equal({
        bar: 'hello',
        foo: {
          a: null,
          b: {
            okay: 'yes',
          },
        },
      });
    });
  });
});
