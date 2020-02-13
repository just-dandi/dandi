import { Relation, Relations } from '@dandi/hal'

import { ListResource } from '../lists/list.resource'

import { TaskResource } from './task.resource'

export * from './task.resource'

@Relations(TaskResource)
export class TaskRelations {

  @Relation(ListResource)
  public list: ListResource
}
