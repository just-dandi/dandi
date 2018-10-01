import { Uuid } from '@dandi/common';
import { HalModelBase, Relation, ResourceId } from '@dandi/hal';
import { Property, Required } from '@dandi/model';

import { ParentResource } from './parent.resource.model';

export class ChildResource extends HalModelBase {
  constructor(source?: any) {
    super(source);
  }

  @Property(Uuid)
  @Required()
  @ResourceId()
  public childId: Uuid;

  @Relation()
  public parent: ParentResource;
}
