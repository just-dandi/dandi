// tslint:disable no-unused-expression
import { expect } from 'chai';
import { DateTime } from 'luxon';

import { isPrimitiveType, Primitive } from './primitive';
import { Url } from './url';
import { Uuid } from './uuid';

describe('Primitive', () => {

    describe('isPrimitiveType', () => {

        it('returns true for "primitive" types', () => {

            expect(isPrimitiveType(Boolean)).to.be.true;
            expect(isPrimitiveType(DateTime)).to.be.true;
            expect(isPrimitiveType(Number)).to.be.true;
            expect(isPrimitiveType(Primitive)).to.be.true;
            expect(isPrimitiveType(String)).to.be.true;
            expect(isPrimitiveType(Uuid)).to.be.true;
            expect(isPrimitiveType(Url)).to.be.true;

        });

        it('returns false for non-"primitive" types', () => {

            expect(isPrimitiveType(Object)).to.be.false;
            expect(isPrimitiveType(Error)).to.be.false;

        });

    });

    describe('ctr', () => {

        it('sets the value property', () => {

            const p = new Primitive(Uuid.for('me'));
            expect(p.value).to.equal(Uuid.for('me'));

        });

    });

});
