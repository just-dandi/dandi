// tslint:disable no-unused-expression
import { expect } from 'chai';

import { getAllKeys, MemberMetadata } from './member.metadata';

describe('MemberMetadata', () => {

    describe('getAllKeys', () => {

        it('discovers all keys of an object', () => {

            const meta = {
                foo: {},
            };

            expect(getAllKeys(meta)).to.deep.equal(['foo']);

        });

        it('discovers all keys of an object with a prototype', () => {

            const parent = {
                foo: {},
            };
            const meta = Object.assign(Object.create(parent), {
                bar: {},
            });

            expect(getAllKeys(meta)).to.deep.equal(['bar', 'foo']);

        });

    });

});
