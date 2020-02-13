import { ListRelation, Relations } from '@dandi/hal'

import { TaskResource } from '../tasks/task.resource'

import { ListResource } from './list.resource'

export * from './list.resource'

@Relations(ListResource)
export class ListRelations {

  @ListRelation(TaskResource)
  public tasks: TaskResource[]
}
