import { TaskResource } from '../tasks/task.resource'

import { List } from './list'

export class ListResource extends List {
  constructor(source?: any) {
    super(source)
  }

  public tasks: TaskResource[]
}
