import { expect } from 'chai';

import { CamelSnakeDataMapper } from './camel.snake.data.mapper';

describe('CamelSnakeDataMapper', () => {
  let dataMapper: CamelSnakeDataMapper;

  beforeEach(() => {
    dataMapper = new CamelSnakeDataMapper();
  });
  afterEach(() => {
    dataMapper = undefined;
  });

  describe('mapFromDb', () => {
    it('creates a hierarchical object from dot notation keys', () => {
      const dbObj = {
        'foo.a': 'yes',
        'foo.b': 'okay',
        bar: 'hello',
      };
      expect(dataMapper.mapFromDb(dbObj)).to.deep.equal({
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
      expect(dataMapper.mapFromDb(dbObj)).to.deep.equal({
        bar: 'hello',
      });
    });

    it('creates child objects for nested structures with some null values', () => {
      const dbObj = {
        'foo.a': null,
        'foo.b': 'yes',
        bar: 'hello',
      };
      expect(dataMapper.mapFromDb(dbObj)).to.deep.equal({
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
      expect(dataMapper.mapFromDb(dbObj)).to.deep.equal({
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
