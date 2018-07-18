import { AmbientInjectableScanner, Container, Injectable, Repository } from '../';
import { expect } from 'chai';

describe('AmbientInjectableScanner', () => {

    describe('scan', () => {

        it('returns the global repository', async () => {

            const scanner = new AmbientInjectableScanner();
            await expect(scanner.scan()).to.eventually.equal(Repository.global);

        });

    });

    it('includes statically referenced injectables', async () => {

        @Injectable()
        class TestInjectable {
        }

        const container = new Container({ providers: [AmbientInjectableScanner] });
        await container.start();

        expect((await container.resolve(TestInjectable)).value).to.be.instanceOf(TestInjectable);


    });

});
