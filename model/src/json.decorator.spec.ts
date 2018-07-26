// tslint:disable no-unused-expression
import { expect } from 'chai';

import { DataPropertyMetadata } from './data.property.metadata';
import { Json }                 from './json.decorator';
import { getMemberMetadata }    from './member.metadata';

describe('@Json()', () => {

    it('sets the json property on a member\'s metadata', () => {

        class TestClass {
            @Json()
            public something: any;
        }

        const meta = getMemberMetadata(TestClass, 'something') as DataPropertyMetadata;
        expect(meta.json).to.be.true;

    });

});
