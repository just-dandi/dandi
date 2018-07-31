import { expect } from 'chai';

import { getControllerMetadata } from './controller.metadata';

describe('getControllerMetadata', () => {
  it('initializes the routeMap for the controller', () => {
    class TestClass {}

    const meta = getControllerMetadata(TestClass);

    expect(meta.routeMap).to.exist;
    expect(meta.routeMap).to.be.instanceOf(Map);
    expect(meta.routeMap).to.be.empty;
  });
});
