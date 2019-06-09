import { Relation, Relations } from '@dandi/hal'

import { ChildResource } from './child.resource.model'
import { ParentResource } from './parent.resource.model'

@Relations(ChildResource)
export class ChildResourceRelations implements Partial<ChildResource> {
  @Relation(ParentResource)
  parent: ParentResource
}
