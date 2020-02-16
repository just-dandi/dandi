import { Uuid } from '@dandi/common'
import { ResourceId } from '@dandi/hal'
import { ModelBase, Property, Required } from '@dandi/model'

export class ListRequest extends ModelBase {
  constructor(source?: any) {
    super(source)
  }

  @Property(String)
  @Required()
  public title: string
}

export class List extends ListRequest {
  constructor(source?: any) {
    super(source)
  }

  @Property(Uuid)
  @Required()
  @ResourceId()
  public listId: Uuid
}
