// tslint:disable no-unused-expression
import { expect } from 'chai';

import { camelCase } from 'change-case';

import { mapKeys } from './map.keys';

describe('mapKeys', () => {

    it('converts the keys of a given object to camel case', () => {

        const date = new Date();
        let source = { 'Foo': 1, 'Bar': 2, 'what-the': 3, 'the-date': date };
        let expected = { 'foo': 1, 'bar': 2, 'whatThe': 3, 'theDate': date };
        let actual = mapKeys(camelCase, source);

        expect(actual).to.deep.equal(expected);

    });

    it('recursively converts the keys of nested objects to camel case', () => {

        let source = { 'Foo': 1, 'Bar': 2, 'what-the': { Fizzle: 3, Bizzle: 4 } };
        let expected = { 'foo': 1, 'bar': 2, 'whatThe': { fizzle: 3, bizzle: 4 } };
        let actual = mapKeys(camelCase, source);

        expect(actual).to.deep.equal(expected);

    });

    it('converts the keys of an array of objects to camel case', () => {

        let source = [
            { 'Foo': 1, 'Bar': 2 },
            { 'Foo': 3, 'Bar': 4 }
        ];
        let expected = [
            { 'foo': 1, 'bar': 2 },
            { 'foo': 3, 'bar': 4 }
        ];
        let actual = mapKeys(camelCase, source);

        expect(actual).to.deep.equal(expected);

    });

    it('converts nested array properties', () => {

        let source = { 'Foo': 1, 'Bar': 2, 'array-prop': [1, 2, 3, 4] };
        let expected = { 'foo': 1, 'bar': 2, 'arrayProp': [1, 2, 3, 4] };
        let actual = mapKeys(camelCase, source);

        expect(actual).to.deep.equal(expected);

    });

});
