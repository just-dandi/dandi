import { expect } from 'chai';
import { SinonSpy, spy } from 'sinon';

import { ComposedResource } from './composed.resource';

describe('ComposedResource', () => {
  let resource: any;
  let composed: ComposedResource<any>;
  let jsonObject: any;

  beforeEach(() => {
    resource = { id: 1 };
    composed = new ComposedResource(resource);
    composed.addSelfLink({ href: 'self' });
  });
  afterEach(() => {
    composed = undefined;
    jsonObject = undefined;
  });

  describe('toJSON', () => {
    describe('no embeds', () => {
      beforeEach(() => {
        jsonObject = composed.toJSON();
      });

      it('copies the original entity', () => {
        expect(jsonObject).to.include(resource);
        expect(jsonObject).not.to.equal(resource);
      });

      it('includes the map of links at _links', () => {
        expect(jsonObject).to.have.property('_links');
      });

      it('does not include the _embedded property if there are no embedded resources', () => {
        expect(jsonObject).not.to.have.property('_embedded');
      });
    });

    describe('with non-array embeds', () => {
      let embeddedToJsonObject: SinonSpy;

      beforeEach(() => {
        const embedded = new ComposedResource({ id: 3 }).addSelfLink({ href: 'parent' });
        embeddedToJsonObject = spy(embedded, 'toJSON');
        composed.embedResource('parent', embedded);

        jsonObject = composed.toJSON();
      });

      it('includes the map of embedded resources as _embedded', () => {
        expect(jsonObject).to.have.property('_embedded');
      });

      it("includes the output of the embedded resource's toJSON", () => {
        expect(embeddedToJsonObject).to.have.been.called;
        expect(jsonObject._embedded.parent).to.equal(embeddedToJsonObject.firstCall.returnValue);
      });
    });

    describe('with array embeds', () => {
      let embeddedToJsonObject: SinonSpy[];

      beforeEach(() => {
        const embedded = [
          new ComposedResource({ id: 3 }).addSelfLink({ href: 'child/3' }),
          new ComposedResource({ id: 4 }).addSelfLink({ href: 'child/4' }),
          new ComposedResource({ id: 5 }).addSelfLink({ href: 'child/5' }),
        ];
        embeddedToJsonObject = embedded.map((item) => spy(item, 'toJSON'));
        composed.embedResource('children', embedded);

        jsonObject = composed.toJSON();
      });

      it('includes the map of embedded resources as _embedded', () => {
        expect(jsonObject).to.have.property('_embedded');
      });

      it("includes the output of the embedded resource's toJSON", () => {
        embeddedToJsonObject.forEach((item, index) => {
          expect(item).to.have.been.called;
          expect(jsonObject._embedded.children[index]).to.equal(item.firstCall.returnValue);
        });
      });
    });
  });
});
