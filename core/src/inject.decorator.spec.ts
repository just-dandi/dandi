import { expect } from 'chai';

import { getInjectableParamMetadata, Inject, InjectionTokenTypeError, methodTarget, SymbolToken } from '../';

describe('@Inject', () => {

    it('sets the specified token on the decorated parameter\'s metadata', () => {

        const token = new SymbolToken('test');
        class TestClass {
            constructor(@Inject(token) param: any) {}
        }
        const meta = getInjectableParamMetadata(methodTarget(TestClass), null, 0);
        expect(meta.token).to.exist;
        expect(meta.token).to.equal(token);

    });

    it('throws if the specified token is not a valid InjectionToken', () => {

        class TestClass {
            constructor(param: any) {}
        }

        expect(() => Inject({} as any)(TestClass, null, 0)).to.throw(InjectionTokenTypeError);

    });

});
