// tslint:disable no-unused-expression
import { expect } from 'chai';

import { DateTimeTypeValidator } from './date.time.type.validator';
import { TypeValidationError } from './type.validator';

describe('DateTimeTypeValidator', () => {

    let validator: DateTimeTypeValidator;

    beforeEach(() => {
        validator = new DateTimeTypeValidator();
    });
    afterEach(() => {
        validator = undefined;
    });

    describe('validate', () => {

        it('converts JavaScript Date objects', () => {

            const date = new Date();
            const result = validator.validate(date, null);
            expect(result.valueOf()).to.equal(date.valueOf());

        });

        it('converts from a number', () => {

            const date = new Date();
            const result = validator.validate(date.valueOf(), null);
            expect(result.valueOf()).to.equal(date.valueOf());

        });

        it('converts from string representation of a number', () => {

            const date = new Date();
            const result = validator.validate(date.valueOf().toString(), null);
            expect(result.valueOf()).to.equal(date.valueOf());

        });

        it('converts from a string format, defaulting to utc if no time zone is specified', () => {

            const date = '2018/06/08 12:53 PM';
            const result = validator.validate(date, { format: 'yyyy/LL/dd hh:mm a' });
            // note: month is zero-based because javascript
            const expected = Date.UTC(2018, 5, 8, 12, 53);
            expect(result.valueOf()).to.equal(expected);

        });

        it('converts from a string format, using the time zone specified in the format', () => {

            const date = '2018/06/08 12:53 PM -0800';
            const result = validator.validate(date, { format: 'yyyy/LL/dd hh:mm a ZZZ' });
            // note: month is zero-based because javascript
            const expected = Date.UTC(2018, 5, 8, 20, 53);
            expect(result.valueOf()).to.equal(expected);

        });

        it('converts from an ISO string', () => {

            const date = new Date();
            const result = validator.validate(date.toISOString(), null);
            expect(result.valueOf()).to.equal(date.valueOf());

        });

        it('throws a TypeValidationError if the date is not valid', () => {

            const date = 'uhh what';
            expect(() => validator.validate(date, null)).to.throw(TypeValidationError);

        });

    });

});
