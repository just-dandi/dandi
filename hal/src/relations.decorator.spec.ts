import { getResourceMetadata } from '@dandi/hal'
import { expect } from 'chai'

import { ChildResource, ChildResourceRelations } from '../test/child.resource'
import { ParentResource } from '../test/parent.resource'

describe('@Relations()', () => {
  it("links the target resource's ResourceMetadata to the decorated class", () => {
    const resourceMeta = getResourceMetadata(ChildResource)
    expect(resourceMeta.idProperty, 'sanity check: missing idProperty === "childId"').to.equal('childId')
    expect(getResourceMetadata(ChildResourceRelations)).to.equal(resourceMeta)
  })

  it('works with interdependent models', () => {
    const childMeta = getResourceMetadata(ChildResource)
    expect(childMeta.relations).to.have.property('parent')
    expect(childMeta.relations.parent).to.deep.equal({ list: false, resource: ParentResource })

    const parentMeta = getResourceMetadata(ParentResource)
    expect(parentMeta.relations).to.have.property('children')
    expect(parentMeta.relations.children).to.deep.equal({ list: true, resource: ChildResource })
  })
})
