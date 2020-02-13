import { Uuid } from '@dandi/common'
import { ResourceId } from '@dandi/hal'
import { ModelBase, Property, Required } from '@dandi/model'

import { List } from '../lists/list'

export class TaskRequest extends ModelBase {
  constructor(source?: any) {
    super(source)
  }

  @Property(String)
  @Required()
  public title: string

  @Property(Uuid)
  public listId?: Uuid
}

export class Task extends TaskRequest {
  constructor(source?: any) {
    super(source)

    if (this.completed === undefined) {
      this.completed = false
    }
  }

  @Property(Uuid)
  @Required()
  @ResourceId()
  public taskId: Uuid

  @Property(Uuid)
  @Required()
  @ResourceId(List, 'list')
  public listId: Uuid

  @Property(Boolean)
  public completed: boolean

  @Property(Number)
  public order: number
}
