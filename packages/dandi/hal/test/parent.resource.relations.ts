import { ListRelation, Relations } from '@dandi/hal'

import { ChildResource } from './child.resource.model'
import { ParentResource } from './parent.resource.model'

@Relations(ParentResource)
export class ParentResourceRelations implements Partial<ParentResource> {
  @ListRelation(ChildResource)
  children: ChildResource[]
}
