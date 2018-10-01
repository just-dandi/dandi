import { Uuid } from '@dandi/common';
import { HalModelBase, ListRelation, ResourceId } from '@dandi/hal';
import { Property, Required } from '@dandi/model';

import { ChildResource } from './child.resource';

export class ParentResource extends HalModelBase {
  constructor(source?: any) {
    super(source);
  }

  @Property(Uuid)
  @Required()
  @ResourceId()
  public parentId: Uuid;

  @ListRelation()
  public children: ChildResource[];
}
